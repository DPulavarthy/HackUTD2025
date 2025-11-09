import pandas as pd
import matplotlib.pyplot as plt

# Load the predictions
df = pd.read_csv("predictions.csv")

# Check structure
print("Preview of predictions:")
print(df.head(), "\n")

# Count predictions
counts = df["satisfaction_pred"].value_counts().sort_index()

# Label mapping
labels = ["Not Satisfied (0)", "Satisfied (1)"]
values = [counts.get(0, 0), counts.get(1, 0)]

# Create bar chart
plt.figure(figsize=(6, 4))
plt.bar(labels, values)
plt.title("Customer Satisfaction Prediction Distribution")
plt.xlabel("Prediction Category")
plt.ylabel("Number of Posts")
plt.grid(axis='y', linestyle='--', alpha=0.6)
plt.tight_layout()
plt.show()
