import pandas as pd
from pyspark.sql import SparkSession
from pyspark.functions import col, round, lit, when, sum as _sum
from abc import ABC, abstractmethod

class MusicEntity(ABC):
    def __init__(self, id: str, data: json):
        self.id = id
        pass
    @abstractmethod
    def getItem(self):
        pass
    @abstractmethod
    def getName(self):
        pass
    @abstractmethod
    def getGenre(self):
        pass

    
class Track(MusicEntity):
    def __init__(self, id: str, data: json):
        self.id = id
        pass
    def getItem(self):
        pass
    def getName(self):
        pass
    def getGenre(self):
        pass

class Album(MusicEntity):
    def __init__(self, id: str, data: json):
        self.id = id
        pass
    def getItem(self):
        pass
    def getName(self):
        pass
    def getGenre(self):
        pass

class Artist(MusicEntity):
    def __init__(self, id: str, data: json):
        self.id = id
        pass
    def getItem(self):
        pass
    def getName(self):
        pass
    def getGenre(self):
        pass


class UserAnalytics:
    def __init__(self, data: JSON, access_token: str):
        self.spark = SparkSession().builder.getOrCreate()
        self.api = SpotifyAPI(access_token)
        self.proxy = SpotifyAPIProxy(self.api)
    
    # ---------------- TOP ITEMS ----------------
    def getTopTracks(self, n=20):
        data = self.proxy.fetch_api("me/top/tracks", params={"limit": n})
        tracks = data.get("items", [])
        # Flatten tracks data into Spark DataFrame
        rdd = spark.sparkContext.parallelize([json.dumps(track) for track in tracks])
        df = spark.read.json(rdd)
        return [json.loads(row) for row in df.toJSON().collect()]

    # ---------------- MINUTES ----------------
    def total_minutes(self):
        return round(self.df["minutes_listened"].sum(), 2)

    def minutes_by_artist(self):
        return self.df.groupby("artist")["minutes_listened"].sum().sort_values(ascending=False)

    def minutes_by_genre(self):
        return self.df.groupby("genre")["minutes_listened"].sum().sort_values(ascending=False)

    def minutes_by_day(self):
        return self.df.groupby("day_of_week")["minutes_listened"].sum().sort_values(ascending=False)


     # ---------------- ARTIST ----------------

    def top_artist(self):
        return self.minutes_by_artist().idxmax()

    def bottom_artist(self):
        return self.minutes_by_artist().idxmin()


    # ---------------- GENRE ----------------

    def top_genre(self):
        return self.minutes_by_genre().idxmax()

    def bottom_genre(self):
        return self.minutes_by_genre().idxmin()
    
     # ---------------- DAY ----------------

    def top_day(self):
        return self.minutes_by_day().idxmax()

    def bottom_day(self):
        return self.minutes_by_day().idxmin()

    # ---------------- AVERAGE MINUTES BY CATEGORY ----------------
    def average_minutes(self):
        return round(self.df["minutes_listened"].mean(), 2)

    def average_minutes_by_artist(self):
        return self.df.groupby("artist")["minutes_listened"].mean().round(2)

    def average_minutes_by_genre(self):
        return self.df.groupby("genre")["minutes_listened"].mean().round(2)

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
        print("Spotify Listening Summary:")
        for k, v in report.items():
            print(f"{k}: {v}")


# ---------- Run standalone ----------
if __name__ == "__main__":
    analytics = MusicAnalytics()
    analytics.print_summary()