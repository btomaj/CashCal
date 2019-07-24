/**
 * @namespace CashCal
 */
var CashCal = CashCal || {};

/**
 * Create a transaction
 *
 * @param {string} name The name describing the transaction
 * @param {integer} value The value of the transaction
 */
CashCal.Transaction = (function () {
    "use strict";

    // Private properties

    // Constructor
    return function Transaction(name, value) {

        if (!(this instanceof CashCal.Transaction)) {
            return new CashCal.Transaction(name, value);
        }

        this.name = name;
        this.value = value;

    };

}());

/**
 * Create a new week for transactions
 *
 * @param {integer} number The week number
 */
CashCal.Week = (function () {
    "use strict";

    // Private properties

    // Private methods
        /**
         * @method getDateOfISOWeek
         * @private
         */
    var getDateOfISOWeek = function getDateOfISOWeek(week, year) {
            var simpleWeek = new Date(year, 0, 1 + (week - 1) * 7),
                dayOfWeek = simpleWeek.getDay(),
                ISOWeekStart = simpleWeek;

            if (dayOfWeek <= 4) {
                ISOWeekStart.setDate(simpleWeek.getDate() - simpleWeek.getDay() + 1);
            } else {
                ISOWeekStart.setDate(simpleWeek.getDate() + 8 - simpleWeek.getDay());
            }

            return ISOWeekStart;
        };


    // Constructor
    return function Week(weekNumber) {

        if (!(this instanceof CashCal.Week)) {
            return new CashCal.Week(weekNumber);
        }

        var calculateBalance = function calculateBalance(balance, transactions) {
                var i = 0,
                    length = transactions.length;

                for (/*i = 0, length = transactions.length*/; i < length; i += 1) {
                    balance += transactions[i].value;
                }

                return balance;
            };

        this.weekNumber = weekNumber;
        this.weekStart = getDateOfISOWeek(weekNumber, new Date().getFullYear());
        this.openingBalance = 0; //TODO get opening balance from previous week
        this.closingBalance = 0;
        this.transactions = [];
        this.addTransaction = function addTransaction(Transaction, index) {
            index = (index > -1) ? index : this.transactions.length;
            this.transactions.splice(index, 0, Transaction);
            this.closingBalance = calculateBalance(this.openingBalance,
                    this.transactions);
                // TODO Notify controller about updated balance
                // TODO record balances after each transaction for each txn?
        },
        this.removeTransaction = function removeTransaction(index) {
            index = (index > -1) ? index : this.transactions.length - 1;
            this.transactions.splice(index, 1);
            this.closingBalance = calculateBalance(this.openingBalance,
                    this.transactions);
                // TODO Notify controller about updated balance
                // TODO record balances after each transaction for each txn?
        },
        this.setOpeningBalance = function setOpeningBalance(balance) {
            this.openingBalance = balance;
            this.closingBalance = calculateBalance(this.openingBalance,
                    this.transactions);
                // TODO Notify controller about updated balance
                // TODO record balances after each transaction for each txn?
        };

    };
}());

CashCal.Forecast = (function () { // MVC: Model
    "use strict";

    var week = [];

    return function Forecast() {
        this.addWeek = function addWeek(Week) {
            week[Week.weekNumber] = Week;
        };
    };

}());


/*`
CashCal.TransactionController = (function () {
    "use strict";

    return function TransactionController(model, view) {

        if (!(this instanceof CashCal.TransactionController)) {
            return new CashCal.TransactionController(model, view);
        }
    

        this.addTransaction = function addTransaction(name, value) {
        };
    };

}());
*/

/**
 * Expects a reference to the classes
 */
CashCal.WeekController = (function () {
    "use strict";

    return function WeekController(model, view) {

        if (!(this instanceof CashCal.WeekController)) {
            return new CashCal.WeekController(model, view);
        }

        var transaction = [];

        this.addTransaction = function addTransaction(name, value) {
            var transactionModel = new CashCal.Transaction(name, value),
                transactionView = new CashCal.TransactionView(transactionModel);

            model.addTransaction(transactionModel);
            view.addTransaction(transactionView);
        };

    };
}());

CashCal.ForecastController = (function () {
    "use strict";

    return function ForecastController(view) {

        if (!(this instanceof CashCal.ForecastController)) {
            return new CashCal.ForecastControlle(view);
        }

        var week = [],
            transaction = [];

        this.addWeek = function addWeek(weekNumber) {
            var weekModel = new CashCal.Week(weekNumber),
                weekView = new CashCal.WeekView(weekModel);

            week[weekNumber] = new CashCal.WeekController(weekModel, weekView);
            view.addWeek(weekView);
        };

        this.addTransaction = function addTransaction(weekNumber, name, value) {
            week[weekNumber].addTransaction(name, value);
        };

    };
}());

CashCal.TransactionView = (function () {
    "use strict";

    return function TransactionView(Transaction) {

        if (!(this instanceof CashCal.TransactionView)) {
            return new CashCal.TransactionView(Transaction);
        }

        var transactionEntry = $(document.createElement("tr"));
        transactionEntry.attr("data-value", Transaction.value);
        transactionEntry.append(
            $(document.createElement("td")).text(Transaction.name),
            document.createElement("td"),
            document.createElement("td")
        );

        return transactionEntry;
    };
}());

/**
 * Expects Week object.
 * TODO if week exists, update week.
 *
 * @namespace CashCal
 * @class WeekView
 * @constructor
 */
CashCal.WeekView = (function () {
    "use strict";

    return function WeekView(Week) {

        if (!(this instanceof CashCal.WeekView)) {
            return new CashCal.WeekView(Week);
        }

        var header = $(document.createElement("tbody"))
                .addClass("thead-light")
                .append(document.createElement("tr")),
            transactions = $(document.createElement("tbody")),
            weekEntry;

        header.children()
            .attr("data-balance", Week.closingBalance)
            .append(
                $(document.createElement("th"))
                    .attr("colspan", 2)
                    .text("Week of " + new Intl.DateTimeFormat("default", {
                        month: "short",
                        day: "numeric"
                    }).format(Week.weekStart)),
                document.createElement("th")
            );

        transactions.attr("id", "week-" + Week.weekNumber);

        weekEntry = header.add(transactions);

        weekEntry.addTransaction = function addTransaction(TransactionView) {
            transactions.append(TransactionView);
            // TODO update balance
        };

        return weekEntry;

        // TODO automatically include existing transactions

    };
}());

/**
 * Expects jQuery object referencing a <table /> element.
 *
 * @namespace CashCal
 * @class ForecastView
 * @constructor
 */
CashCal.ForecastView = (function () {
    "use strict";

    return function ForecastView(table) {

        if (!(this instanceof CashCal.ForecastView)) {
            return new CashCal.ForecastView(table);
        }

        this.addWeek = function addWeek(WeekView) {
            table.append(WeekView);
        };
    };
}());
