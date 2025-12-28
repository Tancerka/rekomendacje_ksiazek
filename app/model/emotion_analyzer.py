import torch
import numpy as np
import json
from transformers import (
    RobertaTokenizer,
    RobertaModel,
    MarianMTModel,
    MarianTokenizer
)
from huggingface_hub import hf_hub_download
from collections import Counter
import torch.nn as nn

# ---------- TRANSLATION ----------
pl_en_model_name = "Helsinki-NLP/opus-mt-pl-en"
pl_en_tokenizer = MarianTokenizer.from_pretrained(pl_en_model_name)
pl_en_model = MarianMTModel.from_pretrained(pl_en_model_name)

def translate_pl_to_en(texts, batch_size=16):
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        inputs = pl_en_tokenizer(batch, return_tensors="pt", truncation=True, padding=True)
        translated = pl_en_model.generate(**inputs)
        results.extend(pl_en_tokenizer.batch_decode(translated, skip_special_tokens=True))
    return results


# ---------- MODEL ----------
class RobertaForMultiLabelClassification(nn.Module):
    def __init__(self, model_name, num_labels, dropout_rate=0.3, use_mean_pooling=True):
        super().__init__()
        self.roberta = RobertaModel.from_pretrained(model_name)
        self.use_mean_pooling = use_mean_pooling
        hidden_size = self.roberta.config.hidden_size
        self.fc1 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc2 = nn.Linear(hidden_size // 2, num_labels)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout_rate)

    def mean_pooling(self, token_embeddings, attention_mask):
        mask = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * mask, 1) / torch.clamp(mask.sum(1), min=1e-9)

    def forward(self, input_ids, attention_mask):
        outputs = self.roberta(input_ids, attention_mask=attention_mask)
        pooled = self.mean_pooling(outputs.last_hidden_state, attention_mask)
        x = self.dropout(self.relu(self.fc1(pooled)))
        return self.fc2(x)


# ---------- LOAD ONCE ----------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_name = "Lakssssshya/roberta-large-goemotions"

tokenizer = RobertaTokenizer.from_pretrained(model_name)

config = json.load(open(hf_hub_download(model_name, "config.json")))
thresholds = np.array(json.load(open(hf_hub_download(model_name, "optimal_thresholds.json"))))

model = RobertaForMultiLabelClassification(
    "roberta-large",
    num_labels=config["num_labels"]
)
state_dict = torch.load(
    hf_hub_download(model_name, "pytorch_model.bin"),
    map_location=device
)
model.load_state_dict(state_dict)
model.to(device).eval()

emotion_labels = [
    'admiration','amusement','anger','annoyance','approval','caring',
    'confusion','curiosity','desire','disappointment','disapproval',
    'disgust','embarrassment','excitement','fear','gratitude','grief',
    'joy','love','nervousness','optimism','pride','realization','relief',
    'remorse','sadness','surprise','neutral'
]

eng2pl = {
    "admiration": "podziw",
    "amusement": "rozbawienie",
    "anger": "gniew",
    "annoyance": "irytacja",
    "approval": "zatwierdzenie",
    "caring": "troska",
    "confusion": "zmieszanie",
    "curiosity": "ciekawość",
    "desire": "pragnienie",
    "disappointment": "rozczarowanie",
    "disapproval": "dezaprobata",
    "disgust": "wstręt",
    "embarrassment": "zakłopotanie",
    "excitement": "ekscytacja",
    "fear": "strach",
    "gratitude": "wdzięczność",
    "grief": "żal",
    "joy": "radość",
    "love": "miłość",
    "nervousness": "nerwowość",
    "optimism": "optymizm",
    "pride": "duma",
    "realization": "uzmysłowienie",
    "relief": "ulga",
    "remorse": "wyrzuty sumienia",
    "sadness": "smutek",
    "surprise": "zaskoczenie",
    "neutral": "neutralne"
}


# ---------- PUBLIC API ----------
def analyze_reviews(text: str, top_n=5):
    if not text:
        return ["neutral"]

    text_en = translate_pl_to_en([text])[0]
    inputs = tokenizer(text_en, return_tensors="pt", truncation=True).to(device)

    with torch.no_grad():
        logits = model(**inputs)
        probs = torch.sigmoid(logits).cpu().numpy()[0]

    emotions = [
        eng2pl[emotion_labels[i]]
        for i, p in enumerate(probs >= thresholds)
        if p
    ]

    return emotions or ["neutralne"]

