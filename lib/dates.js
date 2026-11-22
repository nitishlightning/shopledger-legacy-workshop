// Date utilities for ShopLedger (Indian DD/MM/YYYY format)

function pad2(n) {
  return ('0' + n).slice(-2);
}

exports.today = function () {
  var d = new Date();
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
};

// Accepts stored DD/MM/YYYY dates and YYYY-MM-DD date-picker values.
exports.normalizeDateKey = function (str) {
  var s = String(str || '').trim();
  var stored = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (stored) return stored[3] + '-' + pad2(stored[2]) + '-' + pad2(stored[1]);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
};

exports.getFiscalYear = function (dateStr) {
  var s = exports.normalizeDateKey(dateStr);
  if (!s) return 'FY21-22';
  var parts = s.split('-');
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);
  if (month >= 4) {
    return 'FY' + String(year).slice(-2) + '-' + String(year + 1).slice(-2);
  }
  return 'FY' + String(year - 1).slice(-2) + '-' + String(year).slice(-2);
};
