module.exports = function (totalPage, currentPage) {
    var currentPage = parseInt(currentPage);
    if (totalPage <= 1) {
        return ''
    } else {
        var html = '';
        html += '<nav><ul class="pagination pull-right">'
        for (var i = 1; i <= totalPage; i++) {

            html += '<li ' + (i === currentPage ? ' class="active" ' : '') +  '"><a href="?page=' + i + '">' + i + '</a></li>'
        }
        html += '</ul> </nav>'
        return html
    }
}