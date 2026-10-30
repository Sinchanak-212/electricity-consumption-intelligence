# Data dictionary

## Source dataset

The dataset is the UCI Electricity Load Diagrams 2011-2014 dataset. It contains a timestamp column and 370 anonymized client measurements named `MT_001` through `MT_370`.

## Physical format

- Delimiter: `;`
- Timestamp format: `YYYY-MM-DD HH:MM:SS`
- Decimal format: comma-separated decimals such as `1,25`
- Header: the first field is empty, followed by `MT_001` to `MT_370`

## Record semantics

Each row represents a 15-minute consumption snapshot for all anonymized clients. The dataset is a time-series matrix where each column corresponds to a consumer or anonymized meter and each row corresponds to one interval.

## Expected data quality checks

- Exactly 371 fields per row: 1 timestamp + 370 client values
- timestamps are valid and ordered chronologically
- 15-minute interval consistency is checked for each row sequence
- values are numeric after decimal-comma normalization
- blank or invalid values are flagged separately from real zero readings
- extremely high values are treated as unusual but not automatically invalid
