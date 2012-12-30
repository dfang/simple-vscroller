/**
 * Created with JetBrains WebStorm.
 * User: dfang
 * Date: 12/30/12
 * Time: 6:25 PM
 * Based on vScroller(http://www.egrappler.com/vscroller/index.htm)
 * Just add scroll direction option and callback when one round completed
 * Credits to egrappler.com
 */

(function ($) {
    $.fn.extend({
        vscroller: function (options) {
            var settings = $.extend({ speed: 1000, stay: 2000, newsfeed: '', direction:'up', cache: true, callback: function(){} }, options);

            return this.each(function () {
                var interval = null;
                var mouseIn = false;
                var totalElements;
                var isScrolling = false;
                var h; /* height of one element */
                var t; /* totalHeight of all elements */
                var wrapper = $(this).addClass('news-wrapper');
                if (settings.newsfeed == '') { alert('No XML file specified'); return; }
                $.ajax({
                    url: settings.newsfeed,
                    type: 'GET',
                    dataType: 'xml',
                    cache: settings.cache,
                    success: function (xml) {
                        //if there are news headlines then build the html
                        var contentWrapper = $('<div/>').addClass('news-contents-wrapper');
                        var newsHeader = $('<div/>').addClass('news-header');
                        var newsContents = $('<div/>').addClass('news-contents');
                        wrapper.append(contentWrapper);
                        contentWrapper.append(newsHeader);
                        contentWrapper.append(newsContents);
                        newsHeader.html($(xml).find('newslist').attr('title'));
                        var i = 0;
                        totalElements = $(xml).find('news').length;
                        $(xml).find('news').each(function () {
                            var news = $('<div/>').addClass('news');
                            newsContents.append(news);
                            var history = $('<div/>').addClass('history');
                            var description = $('<div/>').addClass('description');
                            news.append(history);
                            news.append(description);
                            history.append(getCircle($(this).attr('category'), $(this).attr('date')));
                            var url = $(this).attr('url');
                            var htext = $(this).find('headline').text();
                            description.append($('<h1/>').html("<a href='" + url + "'>" + htext + "</a>"));
                            var newsText = $(this).find('detail').text();
                            if (newsText.length > 80) {
                                newsText = newsText.substr(0, 80) + "...";
                            }
                            description.append($('<div/>').addClass('detail').html(newsText));
                        });
                        h = parseFloat($('.news:eq(0)').outerHeight());
                        $('.news', wrapper).each(function () {
                            $(this).css({ top: i++ * h });
                        });
                        t = (totalElements - 1) * h;

                        $('.news:first').addClass('first-item');
                        $('.news:last').addClass('last-item');

                        // when scrolling up, if $('.news') indexOf $('.news.last-item') == 0 , one round complete
                        // when scrolling down, if $('.news') indexOf $('.news.first-item') == length , one round complete

                        newsContents.mouseenter(function () {
                            mouseIn = true;
                            if (!isScrolling) {
                                $('.news').stop(true, false);
                                clearTimeout(interval);
                            }
                        });
                        newsContents.mouseleave(function () {
                            mouseIn = false;
                            interval = setTimeout(scroll, settings.stay);
                        });
                        interval = setTimeout(scroll, 1);
                    }
                });

                function scroll() {
                    if (!mouseIn && !isScrolling) {
                        isScrolling = true;
                        // console.log(settings.direction);

                        if(isRoundComplete()){
                            settings.callback();
                        }

                        if(settings.direction == 'up'){
                            /* .stop( [clearQueue] [, jumpToEnd] ) */
                            $('.news:eq(0)').stop(true, false).animate({ top: -h }, settings.speed, function () {

                                clearTimeout(interval);
                                var current = $('.news:eq(0)').clone(true);
                                current.css({ top: t });
                                $('.news-contents').append(current);
                                $('.news:eq(0)').remove();

                                isScrolling = false;
                                interval = setTimeout(scroll, settings.stay);
                            });
                            $('.news:gt(0)').stop(true, false).animate({ top: '-=' + h }, settings.speed);
                        }else if(settings.direction =='down')
                        {
                            $('.news:last').stop(true, false).animate({ top: t+h }, settings.speed, function () {

                                clearTimeout(interval);
                                var current = $('.news:last').clone(true);
                                current.css({ top: 0 });
                                $('.news-contents').prepend(current);
                                $('.news:last').remove();

                                isScrolling = false;
                                interval = setTimeout(scroll, settings.stay);

                            });
                            $('.news').not('.news:last').stop(true, false).animate({ top: '+=' + h }, settings.speed);
                        }
                    }
                }
                function getCircle(category, date) {
                    date = date.replace(/-/g, '/');
                    var d = new Date(date);
                    var day = '';
                    var month = '';
                    switch (d.getDate()) {
                      case 1:
                      case 21:
                          day = d.getDate() + ' st';
                          break;
                      case 2:
                      case 22:
                          day = d.getDate() + 'nd';
                          break;
                      case 3:
                      case 23:
                          day = d.getDate() + 'rd';
                          break;
                      default:
                          day = d.getDate() + 'th';
                          break;
                    }
                    switch (d.getMonth()) {
                      case 0:
                          month = 'JAN';
                          break;
                      case 1:
                          month = 'FEB';
                          break;
                      case 2:
                          month = 'MAR';
                          break;
                      case 3:
                          month = 'APR';
                          break;
                      case 4:
                          month = 'MAY';
                          break;
                      case 5:
                          month = 'JUN';
                          break;
                      case 6:
                          month = 'JUL';
                          break;
                      case 7:
                          month = 'AUG';
                          break;
                      case 8:
                          month = 'SEP';
                          break;
                      case 9:
                          month = 'OCT';
                          break;
                      case 10:
                          month = 'NOV';
                          break;
                      case 11:
                          month = 'DEC';
                          break;
                    }
                    return $('<div/>').addClass('circle-outer').append($('<div/>').addClass('circle').addClass(category)
                        .append($('<span/>').addClass('day').html(day))
                        .append($('<span/>').html('...').addClass('elipses'))
                        .append($('<span/>').addClass('month').html(month)));
                }
                function isRoundComplete(){
                  // when scrolling up, if $('.news') indexOf $('.news.last-item') == 0 , one round
                  // when scrolling down, if $('.news') indexOf $('.news.first-item') == length , one round
                  if(settings.direction == 'up')
                  {
                      if($('.news').index($('.news.last-item')) == 0){
                          return true;
                      }
                      return false;
                  }else if(settings.direction == 'down'){
                      if($('.news').index($('.news.first-item')) == totalElements - 1 ){
                          return true;
                      }
                      return false;
                  }
                }
            });
        }
    });
})(jQuery);