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

        var editor = $('.html-editor'), modal, form;
        if (editor.length == 1) {
            modal = $('.modal-module');
            form = modal.find('.form-module');

            editor.click(function () {
                var width = $(window).width();
                modal.find('.modal-dialog').width(width - 40);
                modal.modal();
            });

            modal.on('click', '.btn-new', function () {
                var el = $(this).parents('.form-group'), clone = el.clone();
                el.after(clone);
                clone.find('.form-control').val('');
            }).on('click', '.btn-delete', function () {
                if (confirm('确定删除?')) {
                    $(this).parents('.form-group').remove();
                }
            }).on('click', '.btn-save', function () {
                var templateData = {fileds: []}, template = $('[name="template"]').val(),
                    isArray = form.hasClass('form-inline'); // 数组数据

                if (isArray) {
                    templateData.rows = [];

                    form.find('.form-group').each(function (index, group) {
                        var row = [];

                        $(this).find('.form-control').each(function () {
                            var me = $(this), filed = [], name, label, rule, value;

                            name = me.attr('name');
                            label = $.trim(me.prev('.input-group-addon').html());
                            rule = me.data('rule');
                            value = $.trim(me.val());

                            if (index == 0) {
                                filed.push(name, label, rule);
                                templateData.fileds.push(filed);
                            }

                            row.push(value);
                        });
                        templateData.rows.push(row);
                    });
                } else {
                    form.find('.form-group .form-control').each(function () {
                        var me = $(this), filed = [], name, label, rule, value;

                        name = me.attr('name');
                        label = $.trim(me.prev('.input-group-addon').html());
                        rule = me.data('rule');
                        value = $.trim(me.val());

                        filed.push(name, label, rule, value);
                        templateData.fileds.push(filed);
                    });
                }


                $('[name="content"]').html(App.compile(template, templateData.rows));
                $('[name="templateData"]').html(JSON.stringify(templateData));

                modal.modal('hide');
            });

            form.submit(function () {
                return false;
            }).sortable();
        }

        $('[rel="tooltip"]').tooltip();
    }
};

$(function () {
    App.init();
});