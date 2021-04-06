# crave-time

## Description

`crave-time` is a library that provides functionality to evaluate log files that contain data on estimated and actual delivery dates/times.

## Log files

The log files that are parsed by the `crave-time` library must follow a specific format.

Here as an example line of a log file that fits the correct format:

```
2020-12-05T13:32 2020-12-05 13:30-14:00

```

Three pieces of information must be provided for each delivery (one delivery is represented by one line of the log file).

### Expected data format of line in log file

##### 1. Actual Delivery Date and time

In the above example, the Actual Delivery Date and Time are represented by:

`2020-12-05T13:32`, where `2020-12-05` is the date of actual delivery, and `13:32` is the time of actual delivery. The Actual Delivery time is represented using 24 hour time (military time).

`YYYY-MM-DDTHH:MM`

##### 2. Expected Delivery Date

In the same example log line above, the Expected Delivery Date is represented by:

`2020-12-05` which is separated by a whitespace, immediately following the Actual Delivery Date and Time.

`YYYY-MM-DD`

##### 3. Expected Delivery Time Window

In the same above example log line above, the Expected Delivery Time Window is represented by:

`13:30-14:00` where `13:30` is the Start of the Estimated Delivery Time Window, and `14:00` is the End of the Estimated Delivery Time Window. Both the Start and the End of the Estimated Delivery Time Window are represented using 24 hour time (military time).

`HH:MM-HH:MM`

## Usage of function `evaluateLogFile`

The `crave-time` library provides a function `evaluateLogFile` which is used to aggregate the number of early, late, early on-time and late on-time deliveries for a specific day.

```
async function evaluateLogFile(logFileLoc: string): Promise<EvaluateLog>

```

`evaluateLogFile` is an asynchronous function that returns a Promise which resolves to an Object representing the evaluation of the log file data.

`evaluateLogFile` accepts one argument (`logFileLoc`), which is a string representation of the absolute file path of the delivery log file that the user wants to evaluate. It must be an absolute file path, not a relative file path.

An example of the Object of type `EvaluateLog` that is eventually returned by the Promise is:

```
{
  deliveryMetrics: {
    '2020-12-05': { early_on_time: 4, late_on_time: 5, early: 1, late: 3, total: 13 },
    '2020-12-06': { early_on_time: 3, late_on_time: 1, early: 0, late: 1, total: 5 },
    '2020-12-07': { early_on_time: 0, late_on_time: 2, early: 1, late: 0, total: 3 },
    '2020-12-08': { early_on_time: 2, late_on_time: 1, early: 1, late: 1, total: 5 },
    '2020-12-09': { early_on_time: 0, late_on_time: 2, early: 0, late: 1, total: 3 },
    '2020-12-10': { early_on_time: 1, late_on_time: 1, early: 0, late: 0, total: 2 }
  },
  invalidLinesCount: 6
}

```

The value of `deliveryMetrics` is a map, where the key is the Expected Delivery Date, and the value is the aggregated counts of early on-time, late on-time, early and late deliveries made for that Expected Delivery Date. It also shows the total number of orders delivered on that day.

The value of `invalidLinesCount` is an aggregated count of all the lines in the log file that could not be parsed, due to an invalid format of the data.

### Installation

You can install this package via `npm` by running the following command

`npm install @nokane/crave-time`

### Example usage of `evaluateLogFile`

```
import path from 'path';
import { evaluateLogFile } from '@nokane/crave-time';

const fileName = 'orders.txt';
const logLocation = path.resolve(__dirname, "data", fileName);

async function testEvaluate() {
  try {
    const evaluation = await evaluateLogFile(logLocation);
    console.log('Evaluation:', evaluation);
  }
  catch (e) {
    console.log(`error: ${e}`);
  }
}

await testEvaluate();
```
