# tpss-app

Endpoint for api
Base URL: https://glacial-ocean-08411.herokuapp.com

For post 
Endpoint: https://glacial-ocean-08411.herokuapp.com/split-payments/compute

Schema for post request:
{
    "ID": {
      type: number,
      required: true
    },
    "Amount": {
      type: Number,
      required: true
    },
    "Currency": {
      type: String,
      required: true
    },
    "CustomerEmail": {
      type: String,
      required: true
    },
    "SplitInfo": {
      type: Array,
      minItems: 1,
      maxItems: 20,
      items: {
        "SplitType": {
          type: Sting,
          required: true
        },
        "SplitValue": {
          type: Number,
          required: true
        },
        "SplitEntityId": {
          type: String,
          required: true
        },
      }
    }
}
