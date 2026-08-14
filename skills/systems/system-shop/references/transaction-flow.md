# Shop Transaction Flow

OfferDefinition from DataConfig goes through eligibility and price checks. Currency deduction and reward grant commit as one logical transaction. Persist before analytics success and UI refresh.
