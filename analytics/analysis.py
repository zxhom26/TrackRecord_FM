import pandas as pd

# ---------------- MODEL LAYER ----------------
class MusicAnalytics:
    def __init__(self, filepath="analytics/mock_data.json"):
        # Load data
        self.df = pd.read_json(filepath)
        self.clean_data()

    # ---------------- CLEANING DATA ----------------
    def clean_data(self):
        # Convert string columns to str and strip whitespace
        for col in ["track_name", "artist", "genre", "day_of_week"]:
            if col in self.df.columns:
                self.df[col] = self.df[col].astype(str).str.strip()

        # Convert numeric columns to float
        for col in ["duration_s", "minutes_listened"]:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(self.df[col], errors="coerce")

        # Fill missing numeric values with 0
        self.df[["duration_s", "minutes_listened"]] = self.df[["duration_s", "minutes_listened"]].fillna(0)

    # ---------------- ANALYTICS FUNCTIONS ----------------
    def total_minutes(self):
        return round(self.df["minutes_listened"].sum(), 2)

    def minutes_by_artist(self):
        return self.df.groupby("artist")["minutes_listened"].sum().sort_values(ascending=False)

    def minutes_by_genre(self):
        return self.df.groupby("genre")["minutes_listened"].sum().sort_values(ascending=False)

    def minutes_by_day(self):
        return self.df.groupby("day_of_week")["minutes_listened"].sum().sort_values(ascending=False)

    def top_artist(self):
        return self.minutes_by_artist().idxmax()

    def bottom_artist(self):
        return self.minutes_by_artist().idxmin()

    def top_genre(self):
        return self.minutes_by_genre().idxmax()

    def bottom_genre(self):
        return self.minutes_by_genre().idxmin()

    def top_day(self):
        return self.minutes_by_day().idxmax()

    def bottom_day(self):
        return self.minutes_by_day().idxmin()

    # ---------------- SUMMARY REPORT ----------------
    def summary_report(self):
        return {
            "total_minutes": self.total_minutes(),
            "top_artist": self.top_artist(),
            "bottom_artist": self.bottom_artist(),
            "top_genre": self.top_genre(),
            "bottom_genre": self.bottom_genre(),
            "top_day": self.top_day(),
            "bottom_day": self.bottom_day()
        }

    # ---------------- VIEW LAYER ----------------
    def print_summary(self):
        report = self.summary_report()
        print("🎧 Spotify Listening Summary:")
        for k, v in report.items():
            print(f"{k}: {v}")


# ---------- Run standalone ----------
if __name__ == "__main__":
    analytics = MusicAnalytics()
    analytics.print_summary()
