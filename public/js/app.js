var App = {
    compile: (function () {
        return function (template, data) {
            var fn = new Function("data", "var p=[];p.push('" + template.replace(/[\r\t\n]/gm, " ")
                    .split("<%")
                    .join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t")
                    .join("');")
                    .split("%>")
                    .join("p.push('")
                    .split("\r")
                    .join("\\'") + "');return p.join('');");

            return data ? fn(data) : '';
        }
    })(),
    init: function () {
        $('.table').each(function () {
            var me = $(this), cols = me.find('thead th'), rows = me.find('tbody>tr');
            if (rows.length == 0) {
                me.find('tbody').append('<tr><td style="padding: 20px 0;text-align: center;" colspan="' + cols.length + '">无相关数据</td></tr>');
            }
        }).on('click', '.btn-delete', function () {
            var me = $(this), url = me.attr('href');

            if (confirm('确认删除?')) {
                $.ajax({
                    type: 'DELETE',
                    url: url,
                    success: function (result) {
                        if (result.code == 0) {
                            me.parents('tr').remove();
                        } else {
                            alert(result.message);
                        }
                    }
                });
            }

            return false;
        }).find('.btn-copy').on('copy', function (e) {
            var title = $(this).data('original-title'), code = '<!--#include virtual="/ssi/' + title + '" -->';
            e.clipboardData.clearData();
            e.clipboardData.setData("text/plain", code);
            e.preventDefault();
        }).on('aftercopy', function () {
            var d = dialog({
                content: '复制成功!'
            }).show();

            setTimeout(function () {
                d.close().remove();
            }, 2000);
        });

        $('[rel="tooltip"]').tooltip();
    }
};

$(function () {
    App.init();
});

var data = [{
    field: '',
    value: ''
}];