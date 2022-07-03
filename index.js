const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.get("/", (req, res) => res.send("Hello World"));

app.post("/split-payments/compute", async (req, res) => {
  const newTransaction = req.body;
  const { ID, Amount, Currency, CustomerEmail, SplitInfo } = newTransaction;
  try {
    if (ID && Amount && Currency && CustomerEmail && SplitInfo) {
      //Sort arrays based on different transaction types

      let arrayObject = {
        fArray: [],
        pArray: [],
        rArray: [],
      };

      SplitInfo.forEach((item) => {
        switch (item.SplitType) {
          case "FLAT":
            arrayObject.fArray.push(item);
            break;
          case "PERCENTAGE":
            arrayObject.pArray.push(item);
            break;
          case "RATIO":
            arrayObject.rArray.push(item);
          default:
            break;
        }
        return arrayObject;
      });

      // Format for response
      let result = {
        ID: newTransaction.ID,
        Balance: newTransaction.Amount,
        SplitBreakdown: [],
      };

      //Compute split amounts for FLAT
      if (arrayObject.fArray.length > 0) {
        arrayObject.fArray.forEach((transaction) => {
          let { SplitBreakdown } = result;
          const { SplitValue, SplitEntityId } = transaction;

          if (SplitValue && SplitEntityId) {
            if (SplitValue > newTransaction.Amount || SplitValue < 0) {
              // Confirm that split Amount is not less than zero and is less than transaction amount
              throw Error(
                "Split amount value is either greater than transaction amount or less than zero"
              );
            }
            result.Balance = result.Balance - SplitValue;
            SplitBreakdown.push({ SplitEntityId, Amount: SplitValue });
          } else {
            throw Error("SplitValue or SplitEntityId missing");
          }

          return result;
        });
      }

      //Compute split amounts for PERCENTAGE
      if (arrayObject.pArray.length > 0) {
        arrayObject.pArray.forEach((transaction) => {
          let { SplitBreakdown } = result;
          const { SplitValue, SplitEntityId } = transaction;

          if (SplitValue && SplitEntityId) {
            let amount = (SplitValue / 100) * result.Balance;

            // Confirm that split Amount is not less than zero and is less than transaction amount
            if (amount > newTransaction.Amount || amount < 0) {
              throw Error(
                "Split amount value is either greater than transaction amount or less than zero"
              );
            }
            SplitBreakdown.push({
              SplitEntityId,
              Amount: amount,
            });
            result.Balance = result.Balance - amount;
          } else {
            throw Error("SplitValue or SplitEntityId missing");
          }

          return result;
        });
      }

      //Compute split amounts for RATIO
      if (arrayObject.rArray.length > 0) {
        let totalRatio = 0;
        arrayObject.rArray.forEach((transaction) => {
          totalRatio = totalRatio + transaction.SplitValue;
          return totalRatio;
        });

        // Compute split amount for RATIO transactions
        let ratioBalance = result.Balance;

        arrayObject.rArray.forEach((transaction) => {
          let { SplitBreakdown } = result;
          const { SplitValue, SplitEntityId } = transaction;

          if (SplitValue && SplitEntityId) {
            let amount = (SplitValue / totalRatio) * ratioBalance;

            // Confirm that split Amount is not less than zero and is less than transaction amount
            if (amount > newTransaction.Amount || amount < 0) {
              throw Error(
                "Split amount value is either greater than transaction amount or less than zero"
              );
            }
            SplitBreakdown.push({
              SplitEntityId,
              Amount: amount,
            });
            result.Balance = result.Balance - amount;
          } else {
            throw Error("SplitValue or SplitEntityId missing");
          }

          return result;
        });
      }

      //To check if sum of all split amount values is greater than transaction amount
      if (result.Balance < 0) {
        throw Error("balance is zero");
      }
      res.status(200).send({ ...result });
    } else {
      throw Error("Required field missing");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
