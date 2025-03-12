// src/portfolioAnalysis.js
define(['jquery', 'windows/windows'], function($, Windows) {
    var PortfolioAnalysis = function() {
      var $dialog = $('<div class="portfolio-analysis">' +
        '<h1>Portfolio Analysis</h1>' +
        '<div>Total Trades: <span class="total-trades">10</span></div>' +
        '<div>Total Profit: <span class="total-profit">$150.75</span></div>' +
        '<button class="close">Close</button>' +
        '</div>');
  
      // Use createBlankWindow from windows.es6
      var win = Windows.createBlankWindow($dialog, {
        title: 'Portfolio Analysis',
        width: 400,
        height: 300,
        autoOpen: false, // We'll open it manually on click
        closable: true,
        modal: true,
        closeOnEscape: true
      });
  
      this.init = function($elem) {
        $dialog.find('.close').on('click', function() {
          win.dialog('close'); // Close the dialog
        });
        $elem.on('click', function() {
          win.dialog('open'); // Open the dialog
        });
      };
    };
  
    return PortfolioAnalysis;
  });