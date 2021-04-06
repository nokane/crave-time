import * as fs from 'fs';
import * as readline from 'readline';

/**
 *  An evaluation of the delivery log file, created by function `evaluateLogFile`
 */
interface EvaluateLog {
  /** A map of stringified dates (YYYY-MM-DD) to aggregated delivery statistics */
  deliveryMetrics: Record<string, DeliveryCount>;
  /** The total number of lines in the delivery log file that did not conform to the correct format */
  invalidLinesCount: number;
}

/**
 * The aggregated counts of deliveries status for a given day
 */
interface DeliveryCount {
  /** The total number of early on-time deliveries for a given day */
  early_on_time: number;
  /** The total number of late on-time deliveries for a given day */
  late_on_time: number;
  /** The total number of early deliveries for a given day */
  early: number;
  /** The total number of late on-time deliveries for a given day */
  late: number;
  /** The total number of deliveries for a given day */
  total: number;
}

interface DateTimeString {
  delDate: string;
  delTime: string;
  estDate: string;
  estStartTime: string;
  estEndTime: string
}

interface ParsedDateTime {
  delTime: Date;
  estDate: string;
  estStartTime: Date;
  estEndTime: Date;
}

const early_on_time: string = 'early_on_time';
const late_on_time: string = 'late_on_time';
const early: string = 'early';
const late: string = 'late';
const total: string = 'total';
const delDateRegExp: RegExp = /(\d{4})-(\d{2})-(\d{2})T/;
const delTimeRegExp: RegExp = /T(\d{2}):(\d{2})/;
const estDateRegExp: RegExp = / (\d{4})-(\d{2})-(\d{2}) /;
const estStartTimeRegExp: RegExp = / (\d{2}):(\d{2})/;
const estEndTimeRegExp: RegExp = /-(\d{2}):(\d{2})/;

/**
 * Parse a delivery log file and aggregate the number of early, late, early on-time and late on-time
 * deliviveries by day
 * @function evaluateLogFile
 * @param logFileLoc - a string value representing the absolute file path of the delivery log file
 * @returns {Promise<EvalulateLog>} A promise that returns an object that has metrics on delivery timeliness
 */
export async function evaluateLogFile(logFileLoc: string): Promise<EvaluateLog> {
  let evaluateLog: EvaluateLog = {
    deliveryMetrics: {},
    invalidLinesCount: 0
  };

  if (!fs.existsSync(logFileLoc)) {
    throw new Error('file not found');
  }

  const fileStream = fs.createReadStream(logFileLoc);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const dateTimeString: DateTimeString = createDateTimeString(line);
      const parsedDateTime: ParsedDateTime = createParsedDateTime(dateTimeString);

      if (!evaluateLog.deliveryMetrics.hasOwnProperty(parsedDateTime.estDate)) {
        evaluateLog.deliveryMetrics[parsedDateTime.estDate] = createDeliveryCount();
      }
      const delEvaluation: string = evaluateDeliveryTime(parsedDateTime);
      evaluateLog.deliveryMetrics[parsedDateTime.estDate][delEvaluation]++;
      evaluateLog.deliveryMetrics[parsedDateTime.estDate][total]++;
    }
    catch (e) {
      evaluateLog.invalidLinesCount++;
    }
  }

  return evaluateLog;
}

/**
 * Compare actual delivery time to expected delivery thresholds
 * @param dt Date representations of actual delivery time and expected delivery thresholds
 * @returns {string} - Delivery status
 */
function evaluateDeliveryTime(dt: ParsedDateTime): string {
  if (dt.delTime < dt.estStartTime) {
    return early;
  } else if (dt.delTime >= dt.estEndTime) {
    return late;
  }
  const halfTime: Date = new Date(
    dt.estStartTime.getTime()
    + ((dt.estEndTime.getTime() - dt.estStartTime.getTime()) / 2));
  
  if (dt.delTime < halfTime) {
    return early_on_time;
  }
  return late_on_time;
}

/**
 * Parses a line of the logfile and to obtain the delivery date/times
 * @param line - a string representation of a line of the delivery logfile
 * @returns {DateTimeString}
 */
function createDateTimeString(line: string): DateTimeString {
  const delTime: RegExpMatchArray | null = line.match(delTimeRegExp);
  if (delTime === null) {
    throw new Error(`no valid delivery time`);
  }

  const delDate: RegExpMatchArray | null = line.match(delDateRegExp);
  if (delDate === null) {
    throw new Error(`no valid delivery date`);
  }

  const estDate: RegExpMatchArray | null = line.match(estDateRegExp);
  if (estDate === null) {
    throw new Error(`no valid estimated date`);
  }

  const estStartTime: RegExpMatchArray | null = line.match(estStartTimeRegExp);
  if (estStartTime === null) {
    throw new Error(`no valid estimated start time`);
  }

  const estEndTime: RegExpMatchArray | null = line.match(estEndTimeRegExp);
  if (estEndTime === null) {
    throw new Error(`no valid estimated end time`);
  }

  return createDateTimeStringObj(
    delDate,
    delTime,
    estDate,
    estStartTime,
    estEndTime
  );
}

/**
 * Parse RegExp matched values to obtain string date/times needed to create Date objects of deliveries
 * @param delDate RegExp matched value of actual delivery date
 * @param delTime RegExp matched value of actual delivery time
 * @param estDate  RegExp matched value of estimated delivery date
 * @param estStartTime RegExp matched value of estimated delivery start time
 * @param estEndTime RegExp matched value of estimated delivery end time
 * @returns {DateTimeString}
 */
function createDateTimeStringObj(
  delDate: RegExpMatchArray | null,
  delTime: RegExpMatchArray | null,
  estDate: RegExpMatchArray | null,
  estStartTime: RegExpMatchArray | null,
  estEndTime: RegExpMatchArray | null
): DateTimeString {
  return {
    delDate: delDate !== null ? delDate[0].slice(0, -1) : '',
    delTime: delTime !== null ? delTime[0].substring(1) : '',
    estDate: estDate !== null ? estDate[0].slice(1, -1) : '',
    estStartTime: estStartTime !== null ? estStartTime[0].substring(1) : '',
    estEndTime: estEndTime !== null ? estEndTime[0].substring(1) : ''
  };
}

/**
 * Creates Date representations of actual delivery time and expected delivery thresholds
 * @param dateTime 
 * @returns ParsedDateTime
 */
function createParsedDateTime(dateTime: DateTimeString): ParsedDateTime {
  if (!dateTime.delDate) {
    throw new Error('invalid delivery date');
  }
  if (!dateTime.delTime) {
    throw new Error('invalid delivery time');
  }
  if (!dateTime.estDate) {
    throw new Error('invalid estimated delivery date');
  }
  if (!dateTime.estStartTime) {
    throw new Error('invalid estimated delivery start time');
  }
  if (!dateTime.estEndTime) {
    throw new Error('invalid estimated delivery end time');
  }

  const ws = ' ';
  
  const delTime = new Date(dateTime.delDate.concat(ws, dateTime.delTime));
  if (!isValidDate(delTime)) {
    throw new Error('invalid delivery date time');
  }
  const estStartTime = new Date(dateTime.estDate.concat(ws, dateTime.estStartTime));
  if (!isValidDate(estStartTime)) {
    throw new Error('invalid estimated delivery start time');
  }
  const estEndTime = new Date(dateTime.estDate.concat(ws, dateTime.estEndTime));
  if (!isValidDate(estEndTime)) {
    throw new Error('invalid estimated delivery end time');
  }
  if (estStartTime > estEndTime) {
    throw new Error('estimated delivery end time is earlier than estimated delivery start time');
  }
  
  return {
    delTime: delTime,
    estDate: dateTime.estDate,
    estStartTime: estStartTime,
    estEndTime: estEndTime
  };
}

/**
 * Checks if the date representation of a delivery time is valid
 * @param date - Date representation of a delivery time
 * @returns {boolean}
 */
function isValidDate(date: Date): boolean {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return true;
  } 
  return false;
}

/**
 * Initializes a Delivery count for a given day
 * @returns {DeliveryCount}
 */
function createDeliveryCount(): DeliveryCount {
  return {
    early_on_time: 0,
    late_on_time: 0,
    early: 0,
    late: 0,
    total: 0
  }
}
