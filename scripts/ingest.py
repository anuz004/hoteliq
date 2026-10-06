from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


def main() -> None:
    parser = argparse.ArgumentParser(description='Ingest the HotelIQ CSV dataset into processed data files.')
    parser.add_argument('csv_path', nargs='?', default='data/raw/Hotel book.csv')
    parser.add_argument('--output', default='data/processed/hotel_book.csv')
    args = parser.parse_args()

    src = Path(args.csv_path)
    df = pd.read_csv(src)
    df['date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
    df = df.sort_values('date').reset_index(drop=True)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    print(f'Processed {len(df)} rows and saved to {out}')


if __name__ == '__main__':
    main()
