
import argparse
import joblib
import numpy as np
import pandas as pd
import re
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.base import BaseEstimator, TransformerMixin

URL_RE = re.compile(r"https?://\S+|www\.\S+")
MENTION_RE = re.compile(r"@[A-Za-z0-9_]+")
HASHTAG_RE = re.compile(r"#")
EMOJI_RE = re.compile("["
                      u"\U0001F600-\U0001F64F"  # emoticons
                      u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                      u"\U0001F680-\U0001F6FF"  # transport & map symbols
                      u"\U0001F1E0-\U0001F1FF"  # flags
                      u"\U00002700-\U000027BF"
                      u"\U000024C2-\U0001F251"
                      "]+", flags=re.UNICODE)

def basic_clean(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = URL_RE.sub(" ", text)
    text = MENTION_RE.sub(" ", text)
    text = HASHTAG_RE.sub("", text)  # keep the tag word
    text = EMOJI_RE.sub(" ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)  # remove punctuation
    text = re.sub(r"\s+", " ", text).strip()
    return text

class TextCleaner(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return np.array([basic_clean(x) for x in X])

def build_pipeline():
    return Pipeline([
        ("clean", TextCleaner()),
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=2, max_df=0.95)),
        ("clf", LogisticRegression(max_iter=200, class_weight="balanced"))
    ])

def train(data_path: Path, model_out: Path):
    df = pd.read_csv(data_path)
    if "text" not in df.columns:
        raise ValueError("CSV must contain a 'text' column.")
    if "satisfaction" not in df.columns:
        raise ValueError("CSV must contain a binary 'satisfaction' column (1=satisfied, 0=not).")
    X = df["text"]
    y = df["satisfaction"].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:,1]
    print("Evaluation on held-out test set:")
    print(classification_report(y_test, y_pred, digits=3))
    try:
        auc = roc_auc_score(y_test, y_proba)
        print(f"ROC AUC: {auc:.3f}")
    except Exception:
        pass
    joblib.dump(pipe, model_out)
    print(f"Saved model to {model_out}")

def predict(model_path: Path, data_path: Path, out_path: Path):
    pipe = joblib.load(model_path)
    df = pd.read_csv(data_path)
    if "text" not in df.columns:
        raise ValueError("CSV must contain a 'text' column.")
    proba = pipe.predict_proba(df["text"])[:,1]
    pred = (proba >= 0.5).astype(int)
    out = df.copy()
    out["satisfaction_prob"] = proba
    out["satisfaction_pred"] = pred
    out.to_csv(out_path, index=False)
    print(f"Wrote predictions to {out_path}")

def main():
    parser = argparse.ArgumentParser(description="Customer Satisfaction Classifier for Social Posts")
    subparsers = parser.add_subparsers(dest="cmd", required=True)

    p_train = subparsers.add_parser("train", help="Train model")
    p_train.add_argument("--data", type=Path, required=True, help="Path to labeled CSV with columns: text, satisfaction")
    p_train.add_argument("--model-out", type=Path, default=Path("csat_model.joblib"), help="Where to save the trained model")

    p_pred = subparsers.add_parser("predict", help="Run predictions")
    p_pred.add_argument("--model", type=Path, required=True, help="Path to trained model .joblib")
    p_pred.add_argument("--data", type=Path, required=True, help="Path to unlabeled CSV with a 'text' column")
    p_pred.add_argument("--out", type=Path, default=Path("predictions.csv"), help="Where to write predictions CSV")

    args = parser.parse_args()
    if args.cmd == "train":
        train(args.data, args.model_out)
    elif args.cmd == "predict":
        predict(args.model, args.data, args.out)

if __name__ == "__main__":
    main()
