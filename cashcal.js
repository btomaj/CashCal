/*jslint devel */
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
    return function Transaction(week, name, value) {

        if (!(this instanceof CashCal.Transaction)) {
            return new CashCal.Transaction(week, name, value);
        }

        this.name = name;
        this.value = value;
        this.week = week;

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

        this.weekNumber = weekNumber;
        this.weekStart = getDateOfISOWeek(weekNumber, new Date().getFullYear());

    };
}());

CashCal.Forecast = (function () { // MVC: Model
    "use strict";

    return function Forecast() {
        var week = [],
            openingBalance = 0;

        };

        this.setOpeningBalance = function setOpeningBalance(balance) {
            openingBalance = balance;
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

CashCal.ForecastController = (function () {
    "use strict";

    return function ForecastController(Forecast, ForecastView) {

        if (!(this instanceof CashCal.ForecastController)) {
            return new CashCal.ForecastControlle(ForecastView);
        }

        this.addTransaction = function addTransaction(weekNumber, name, value) {
            var transactionModel = new CashCal.Transaction(weekNumber, name, value),
                transactionView = new CashCal.TransactionView(transactionModel);

            Forecast.addTransaction(transactionModel);
            ForecastView.addTransaction(transactionModel, transactionView);
        };

        this.setOpeningBalance = function setOpeningBalance(openingBalance) {
            Forecast.setOpeningBalance(openingBalance);
            ForecastView.setOpeningBalance(openingBalance);
        };
    };
}());

CashCal.TransactionView = (function () {
    "use strict";

    var mutationObserver = new MutationObserver(function (mutations) {
            var value,
                i;
            for (i of mutations) {
                switch (i.attributeName) {
                    case "data-value":
                        value = $(i.target).attr(i.attributeName);
                        if (value < 0) {
                            value = "<span style=\"color:red\">&minus;</span> $" + value.slice(1);
                        } else {
                            value = "<span style=\"color:green\">+</span> $" + value;
                        }
                        $(i.target).children().eq(1).html(value);
                        break;

                    case "data-balance":
                        value = $(i.target).attr(i.attributeName);
                        if (value < 0) {
                            value = "&minus; $" + value.slice(1);
                        } else {
                            value = "<span style=\"color:white\">+</span> $" + value;
                        }
                        $(i.target).children().last().html(value);
                        break;
                }
            }
        });

    return function TransactionView(Transaction) {

        if (!(this instanceof CashCal.TransactionView)) {
            return new CashCal.TransactionView(Transaction);
        }

        var transactionEntry = $(document.createElement("tr"));
        transactionEntry.append(
            $(document.createElement("td")).text(Transaction.name),
            document.createElement("td"),
            document.createElement("td")
        );
        mutationObserver.observe(transactionEntry[0], {
            attributes: true,
            attributeFilter: [
                "data-value",
                "data-balance"
            ],
            childList: false,
            subtree: false
        });
        transactionEntry.attr("data-value", Transaction.value);

        return transactionEntry;
    };
}());

/**
 *
 * @namespace CashCal
 * @class WeekView
 * @constructor
 *
 * @param Week {Week} Week object.
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
            .append(
                $(document.createElement("th"))
                    .attr("colspan", 3)
                    .text("Week of " + new Intl.DateTimeFormat("default", {
                        month: "short",
                        day: "numeric"
                    }).format(Week.weekStart))
            );

        transactions.attr("id", "week-" + Week.weekNumber);

        weekEntry = header.add(transactions);

        weekEntry.addTransaction = function addTransaction(TransactionView) {
            transactions.append(TransactionView);
            // TODO update balance
        };

        return weekEntry;

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

    var week = [],
        mutationObserver = new MutationObserver(function (mutations) {
            var value,
                i;
            for (i of mutations) {
                if (i.attributeName === "data-balance") {
                    value = $(i.target).attr(i.attributeName);
                    if (value < 0) {
                        value = "&minus; $" + value.slice(1);
                    } else {
                        value = "<span style=\"color:white\">+</span> $" + value;
                    }
                    $(i.target).children().last().html(value);
                }
            }
        });

    return function ForecastView(table) {

        if (!(this instanceof CashCal.ForecastView)) {
            return new CashCal.ForecastView(table);
        }

        var openingBalance = $(document.createElement("tbody"))
            .append($(document.createElement("tr"))
                .append(
                    $(document.createElement("td")).text("Opening balance")
                        .attr("colspan", 2),
                    document.createElement("td"), // TODO display value
                )
            );

        table.append(openingBalance);
        mutationObserver.observe(openingBalance.children()[0], {
            attributes: true,
            attributeFilter: [
                "data-balance"
            ],
            childList: false,
            subtree: false
        });

        this.setOpeningBalance = function setOpeningBalance(balance) {
            openingBalance.children().attr("data-balance", balance);
        };

        this.addWeek = function addWeek(Week, WeekView) {
            week[Week.weekNumber] = WeekView;
            table.append(WeekView);
            //TODO add weeks in any order
        };

        this.addTransaction = function addTransaction(Transaction, TransactionView) {
            if (week[Transaction.week] === undefined) {
                var weekModel = new CashCal.Week(Transaction.week),
                    weekView = new CashCal.WeekView(weekModel);

                this.addWeek(weekModel, weekView);
                //FormController.addWeek(weekModel);
            }

            week[Transaction.week].addTransaction(TransactionView);
        };
    };
}());
