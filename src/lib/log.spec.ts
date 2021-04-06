import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { evaluateLogFile } from './log';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('evaluateLogFile()', async () => { 
  it('should eventually return an object', async () => {
    const fileName = 'orders.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    await expect(evaluateLogFile(logLocation)).to.eventually.be.a('object');
  });

  it('should throw an error with an invalid log location', async () => {
    const fileName = 'imaginary.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    try {
      const resp = await evaluateLogFile(logLocation);
    }
    catch (e) {
      expect(e).to.be.an('error');
    }
  });

  it('should catch invalid delivery dates', async () => {
    const fileName = 'invalid_del_dates.txt';
    const dateCheck = '2020-12-05';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    expect(resp.deliveryMetrics).to.have.property(dateCheck);
    expect(resp.invalidLinesCount).to.equal(5);
  });

  it('should catch invalid delivery times', async () => {
    const fileName = 'invalid_del_times.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    expect(resp.invalidLinesCount).to.equal(6);
  });

  it('should catch invalid estimated dates', async () => {
    const fileName = 'invalid_est_dates.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    expect(resp.invalidLinesCount).to.equal(6);
  });

  it('should catch invalid estimated delivery start times', async () => {
    const fileName = 'invalid_start_times.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    expect(resp.invalidLinesCount).to.equal(6);
  });

  it('should catch invalid estimated delivery end times', async () => {
    const fileName = 'invalid_end_times.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    expect(resp.invalidLinesCount).to.equal(6);
  });

  it('should catch estimated delivery start times that are later than estimated delivery end times', async () => {
    const fileName = 'invalid_est_times.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    expect(resp.invalidLinesCount).to.equal(1);
  });

  it('should count the correct number of early deliveries', async () => {
    const fileName = 'orders.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    const dateFifth = '2020-12-05';
    const dateSixth = '2020-12-06';
    const dateSeventh = '2020-12-07';
    const dateEigth = '2020-12-08';
    const dateNineth = '2020-12-09';
    const dateTenth = '2020-12-10';
    const deliveryMetrics = 'deliveryMetrics';
    const early = 'early';
    expect(resp[deliveryMetrics][dateFifth][early]).to.equal(1);
    expect(resp[deliveryMetrics][dateSixth][early]).to.equal(0);
    expect(resp[deliveryMetrics][dateSeventh][early]).to.equal(1);
    expect(resp[deliveryMetrics][dateEigth][early]).to.equal(1);
    expect(resp[deliveryMetrics][dateNineth][early]).to.equal(0);
    expect(resp[deliveryMetrics][dateTenth][early]).to.equal(0);
  });

  it('should count the correct number of late deliveries', async () => {
    const fileName = 'orders.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    const dateFifth = '2020-12-05';
    const dateSixth = '2020-12-06';
    const dateSeventh = '2020-12-07';
    const dateEigth = '2020-12-08';
    const dateNineth = '2020-12-09';
    const dateTenth = '2020-12-10';
    const deliveryMetrics = 'deliveryMetrics';
    const late = 'late';
    expect(resp[deliveryMetrics][dateFifth][late]).to.equal(3);
    expect(resp[deliveryMetrics][dateSixth][late]).to.equal(1);
    expect(resp[deliveryMetrics][dateSeventh][late]).to.equal(0);
    expect(resp[deliveryMetrics][dateEigth][late]).to.equal(1);
    expect(resp[deliveryMetrics][dateNineth][late]).to.equal(1);
    expect(resp[deliveryMetrics][dateTenth][late]).to.equal(0);
  });

  it('should count the correct number of early on-time deliveries', async () => {
    const fileName = 'orders.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    const dateFifth = '2020-12-05';
    const dateSixth = '2020-12-06';
    const dateSeventh = '2020-12-07';
    const dateEigth = '2020-12-08';
    const dateNineth = '2020-12-09';
    const dateTenth = '2020-12-10';
    const deliveryMetrics = 'deliveryMetrics';
    const early_on_time = 'early_on_time';
    expect(resp[deliveryMetrics][dateFifth][early_on_time]).to.equal(4);
    expect(resp[deliveryMetrics][dateSixth][early_on_time]).to.equal(3);
    expect(resp[deliveryMetrics][dateSeventh][early_on_time]).to.equal(0);
    expect(resp[deliveryMetrics][dateEigth][early_on_time]).to.equal(2);
    expect(resp[deliveryMetrics][dateNineth][early_on_time]).to.equal(0);
    expect(resp[deliveryMetrics][dateTenth][early_on_time]).to.equal(1);
  });

  it('should count the correct number of late on-time deliveries', async () => {
    const fileName = 'orders.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    const dateFifth = '2020-12-05';
    const dateSixth = '2020-12-06';
    const dateSeventh = '2020-12-07';
    const dateEigth = '2020-12-08';
    const dateNineth = '2020-12-09';
    const dateTenth = '2020-12-10';
    const deliveryMetrics = 'deliveryMetrics';
    const late_on_time = 'late_on_time';
    expect(resp[deliveryMetrics][dateFifth][late_on_time]).to.equal(5);
    expect(resp[deliveryMetrics][dateSixth][late_on_time]).to.equal(1);
    expect(resp[deliveryMetrics][dateSeventh][late_on_time]).to.equal(2);
    expect(resp[deliveryMetrics][dateEigth][late_on_time]).to.equal(1);
    expect(resp[deliveryMetrics][dateNineth][late_on_time]).to.equal(2);
    expect(resp[deliveryMetrics][dateTenth][late_on_time]).to.equal(1);
  });

  it('should count the correct number of total deliveries', async () => {
    const fileName = 'orders.txt';
    const logLocation = path.resolve(__dirname, "../../test/data", fileName);
    const resp = await evaluateLogFile(logLocation);
    const dateFifth = '2020-12-05';
    const dateSixth = '2020-12-06';
    const dateSeventh = '2020-12-07';
    const dateEigth = '2020-12-08';
    const dateNineth = '2020-12-09';
    const dateTenth = '2020-12-10';
    const deliveryMetrics = 'deliveryMetrics';
    const total = 'total';
    expect(resp[deliveryMetrics][dateFifth][total]).to.equal(13);
    expect(resp[deliveryMetrics][dateSixth][total]).to.equal(5);
    expect(resp[deliveryMetrics][dateSeventh][total]).to.equal(3);
    expect(resp[deliveryMetrics][dateEigth][total]).to.equal(5);
    expect(resp[deliveryMetrics][dateNineth][total]).to.equal(3);
    expect(resp[deliveryMetrics][dateTenth][total]).to.equal(2);
  });
});