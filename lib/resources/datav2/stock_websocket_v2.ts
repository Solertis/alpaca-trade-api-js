import {
  AlpacaTradeV2,
  AlpacaQuoteV2,
  AlpacaBarV2,
  AlpacaLuldV2,
  AlpacaStatusV2,
  AlpacaTrade,
  AlapacaQuote,
  AlpacaBar,
  AlpacaStatus,
  AlpacaLuld,
  RawTrade,
  RawQuote,
  RawBar,
  RawLuld,
  RawStatus,
} from "./entityv2";
import {
  AlpacaWebsocket as Websocket,
  EVENT,
  ERROR,
  WebsocketOptions,
} from "./websocket";

interface StockWebsocketOptions extends WebsocketOptions {
  feed?: string;
}
interface StockWebSocketSession {
  trades: Array<string>;
  quotes: Array<string>;
  bars: Array<string>;
  dailyBars: Array<string>;
  statuses: Array<string>;
  lulds: Array<string>;
}
export class AlpacaStocksClient extends Websocket {
  constructor(options: StockWebsocketOptions) {
    const url: string =
      "wss" +
      options.url.substr(options.url.indexOf(":")) +
      "/v2/" +
      options.feed;
    options.url = url;
    options.subscriptions = {
      trades: [],
      quotes: [],
      bars: [],
      dailyBars: [],
      statuses: [],
      lulds: [],
    } as StockWebSocketSession;
    super(options);
  }

  subscribeForTrades(trades: Array<string>): void {
    this.session.subscriptions.trades.push(...trades);
    this.subscribe({ trades });
  }

  subscribeForQuotes(quotes: Array<string>): void {
    this.session.subscriptions.quotes.push(...quotes);
    this.subscribe({ quotes });
  }

  subscribeForBars(bars: Array<string>): void {
    this.session.subscriptions.bars.push(...bars);
    this.subscribe({ bars });
  }

  subscribeForDailyBars(dailyBars: Array<string>): void {
    this.session.subscriptions.dailyBars.push(...dailyBars);
    this.subscribe({ dailyBars });
  }
  subscribeForStatuses(statuses: Array<string>): void {
    this.session.subscriptions.statuses.push(...statuses);
    this.subscribe({ statuses });
  }

  subscribeForLulds(lulds: Array<string>): void {
    this.session.subscriptions.lulds.push(...lulds);
    this.subscribe({ lulds });
  }

  subscribe(symbols: {
    trades?: Array<string>;
    quotes?: Array<string>;
    bars?: Array<string>;
    dailyBars?: Array<string>;
    statuses?: Array<string>;
    lulds?: Array<string>;
  }): void {
    const subMsg = {
      action: "subscribe",
      trades: symbols.trades ?? [],
      quotes: symbols.quotes ?? [],
      bars: symbols.bars ?? [],
      dailyBars: symbols.dailyBars ?? [],
      statuses: symbols.statuses ?? [],
      lulds: symbols.lulds ?? [],
    };
    this.conn.send(this.msgpack.encode(subMsg));
  }

  subscribeAll(): void {
    const { trades, quotes, bars, dailyBars, statuses, lulds } =
      this.session.subscriptions;
    if (
      trades.length > 0 ||
      quotes.length > 0 ||
      bars.length > 0 ||
      dailyBars.length > 0 ||
      statuses.length > 0 ||
      lulds.level > 0
    ) {
      const msg = {
        action: "subscribe",
        trades,
        quotes,
        bars,
        dailyBars,
        statuses,
        lulds,
      };
      this.conn.send(this.msgpack.encode(msg));
    }
  }

  unsubscribeFromTrades(trades: Array<string>): void {
    this.session.subscriptions.trades =
      this.session.subscriptions.trades.filter(
        (trade: string) => !trades.includes(trade)
      );
    this.unsubscribe({ trades });
  }

  unsubscribeFromQuotes(quotes: Array<string>): void {
    this.session.subscriptions.quotes =
      this.session.subscriptions.quotes.filter(
        (quote: string) => !quotes.includes(quote)
      );
    this.unsubscribe({ quotes });
  }

  unsubscribeFromBars(bars: Array<string>): void {
    this.session.subscriptions.bars = this.session.subscriptions.bars.filter(
      (bar: string) => !bars.includes(bar)
    );
    this.unsubscribe({ bars });
  }

  unsubscriceFromDailyBars(dailyBars: Array<string>): void {
    this.session.subscriptions.dailyBars =
      this.session.subscriptions.dailyBars.filter(
        (dailyBar: string) => !dailyBars.includes(dailyBar)
      );
    this.unsubscribe({ dailyBars });
  }

  unsubscribeFromStatuses(statuses: Array<string>): void {
    this.session.subscriptions.statuses =
      this.session.subscriptions.statuses.filter(
        (status: string) => !statuses.includes(status)
      );
    this.unsubscribe({ statuses });
  }

  unsubscribeFromLulds(lulds: Array<string>): void {
    this.session.subscriptions.statuses =
      this.session.subscriptions.lulds.filter(
        (luld: string) => !lulds.includes(luld)
      );
    this.unsubscribe({ lulds });
  }

  unsubscribe(symbols: {
    trades?: Array<string>;
    quotes?: Array<string>;
    bars?: Array<string>;
    dailyBars?: Array<string>;
    statuses?: Array<string>;
    lulds?: Array<string>;
  }): void {
    const unsubMsg = {
      action: "unsubscribe",
      trades: symbols.trades ?? [],
      quotes: symbols.quotes ?? [],
      bars: symbols.bars ?? [],
      dailyBars: symbols.dailyBars ?? [],
      statuses: symbols.statuses ?? [],
      lulds: symbols.lulds ?? [],
    };
    this.conn.send(this.msgpack.encode(unsubMsg));
  }

  updateSubscriptions(msg: {
    trades: Array<string>;
    quotes: Array<string>;
    bars: Array<string>;
    dailyBars: Array<string>;
    statuses: Array<string>;
    lulds: Array<string>;
  }): void {
    this.log(
      `listening to streams:
        trades: ${msg.trades},
        quotes: ${msg.quotes},
        bars: ${msg.bars},
        dailyBars: ${msg.dailyBars},
        statuses: ${msg.statuses},
        lulds: ${msg.lulds}`
    );
    this.session.subscriptions = {
      trades: msg.trades,
      quotes: msg.quotes,
      bars: msg.bars,
      dailyBars: msg.dailyBars,
      statuses: msg.statuses,
      lulds: msg.lulds,
    };
  }

  onStockTrade(fn: (tarde: AlpacaTrade) => void): void {
    this.on(EVENT.TRADES, (trade: AlpacaTrade) => fn(trade));
  }

  onStockQuote(fn: (quote: AlapacaQuote) => void): void {
    this.on(EVENT.QUOTES, (quote: AlapacaQuote) => fn(quote));
  }

  onStockBar(fn: (bar: AlpacaBar) => void): void {
    this.on(EVENT.BARS, (bar: AlpacaBar) => fn(bar));
  }

  onStockDailyBar(fn: (dailyBar: AlpacaBar) => void): void {
    this.on(EVENT.DAILY_BARS, (dailyBar: AlpacaBar) => fn(dailyBar));
  }

  onStatuses(fn: (status: AlpacaStatus) => void): void {
    this.on(EVENT.TRADING_STATUSES, (status: AlpacaStatus) => fn(status));
  }

  onLulds(fn: (luld: AlpacaLuld) => void): void {
    this.on(EVENT.LULDS, (luld: AlpacaLuld) => fn(luld));
  }

  dataHandler(
    data: Array<RawTrade | RawQuote | RawBar | RawStatus | RawLuld>
  ): void {
    data.forEach(
      (element: RawTrade | RawQuote | RawBar | RawStatus | RawLuld) => {
        if ("T" in element) {
          switch (element.T) {
            case "t":
              this.emit(EVENT.TRADES, AlpacaTradeV2(element as RawTrade));
              break;
            case "q":
              this.emit(EVENT.QUOTES, AlpacaQuoteV2(element as RawQuote));
              break;
            case "b":
              this.emit(EVENT.BARS, AlpacaBarV2(element as RawBar));
              break;
            case "d":
              this.emit(EVENT.DAILY_BARS, AlpacaBarV2(element as RawBar));
              break;
            case "s":
              this.emit(
                EVENT.TRADING_STATUSES,
                AlpacaStatusV2(element as RawStatus)
              );
              break;
            case "l":
              this.emit(EVENT.LULDS, AlpacaLuldV2(element as RawLuld));
              break;
            default:
              this.emit(EVENT.CLIENT_ERROR, ERROR.UNEXPECTED_MESSAGE);
          }
        }
      }
    );
  }
}
