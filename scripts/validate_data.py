from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


def main() -> None:
    parser = argparse.ArgumentParser(description='Validate data quality for the hotel CSV.')
    parser.add_argument('csv_path', nargs='?', default='data/raw/Hotel book.csv')
    args = parser.parse_args()

    df = pd.read_csv(args)
    issues = {
        'rows': len(df),
        'columns': len(df.columns),
        'missing_values': int(df.isna().sum().sum()),
        'duplicate_rows': int(df.duplicated().sum()),
        'invalid_dates': int(pd.to_datetime(df['Date'], errors='coerce').isna().sum()),
        'suspicious_occupancy': int(((df['Occupancy_Rate'] < 0) | (df['Occupancy_Rate'] > 1)).sum()),
    }
    print(issues)


if __name__ == '__main__':
    main()
