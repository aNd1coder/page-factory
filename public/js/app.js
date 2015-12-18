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
        });

        $(document).on('copy', '.btn-copy', function (e) {
            var me = $(this), code;

            if (me.parents('.page-upload').length > 0) {
                code = me.data('src');
            } else if (me.parents('.page-hota').length > 0) {
                code = $('#code_wrap').val();
            } else {
                code = '<!--#include virtual="/ssi/' + me.attr('title') + '" -->';
            }

            e.clipboardData.clearData();
            e.clipboardData.setData("text/plain", code);
            e.preventDefault();

            return false;
        }).on('aftercopy', '.btn-copy', function () {
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
                var templateData = {fields: []}, template = $('[name="template"]').val(),
                    isArray = form.hasClass('form-inline'); // 数组数据

                if (isArray) {
                    templateData.rows = [];

                    form.find('.form-group').each(function (index, group) {
                        var row = [];

                        $(this).find('.form-control').each(function () {
                            var me = $(this), field = [], name, label, rule, value;

                            name = me.attr('name');
                            label = $.trim(me.prev('.input-group-addon').html());
                            rule = me.data('rule');
                            value = $.trim(me.val());

                            if (index == 0) {
                                field.push(name, label, rule);
                                templateData.fields.push(field);
                            }

                            row.push(value);
                        });
                        templateData.rows.push(row);
                    });
                } else {
                    form.find('.form-group .form-control').each(function () {
                        var me = $(this), field = [], name, label, rule, value;

                        name = me.attr('name');
                        label = $.trim(me.prev('.input-group-addon').html());
                        rule = me.data('rule');
                        value = $.trim(me.val());

                        field.push(name, label, rule, value);
                        templateData.fields.push(field);
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

        $('.form-authorize').submit(function () {
            var form = $(this);

            $.ajax({
                type: form.attr('method'),
                url: form.attr('action'),
                data: form.serialize(),
                dataType: 'json',
                success: function (result) {
                    var code = result.code, panel, message = result.message;

                    if (code == 0) {
                        location.href = '/';
                    } else {
                        panel = $('.authorize-message').empty();

                        if (message.length > 0) {
                            if (typeof message == 'string') {
                                panel.append('<li>' + message + '</li>');
                            } else {
                                $.each(message, function (i, msg) {
                                    panel.append('<li>' + msg + '</li>');
                                });
                            }

                            panel.removeClass('hidden');
                        }
                    }
                }
            });

            return false;
        });

        if ($('html').hasClass('page-upload')) {
            var html = '', tpl = $('#tpl-file-item').html(), data,
                historyFiles, cacheKey = 'page_factory_history_upload_files';

            historyFiles = JSON.parse(window.localStorage.getItem(cacheKey)) || [];

            if (historyFiles.length > 0) {
                html = App.compile(tpl, historyFiles);
                $('.list-files .list-group-item:first').after(html);

                $('[data-toggle="popover"]').popover({html: true, placement: 'right', trigger: 'hover'});
            }

            $('#btn-upload').uploadify({
                buttonClass: "btn btn-default",
                buttonText: '<i class="glyphicon glyphicon-upload"></i>选择图片',
                swf: '/vendor/uploadify/uploadify.swf',
                uploader: '/upload',
                fileTypeExts: '*.gif; *.jpg; *.png',
                fileSizeLimit: '250KB',
                uploadLimit: 10,
                onUploadSuccess: function (file, result) {
                    result = JSON.parse(result);
                    data = result.data;

                    if (result.code == 0) {
                        html = App.compile(tpl, [data.url]);

                        $('.list-files .list-group-item:first').after(html);

                        $('[data-toggle="popover"]').popover({html: true, placement: 'right', trigger: 'hover'});

                        historyFiles.unshift(data.url);

                        if (historyFiles.length >= 5) {
                            historyFiles.pop();
                        }

                        window.localStorage.setItem(cacheKey, JSON.stringify(historyFiles));
                    }
                }
            });


        }
    }
};

$(function () {
    App.init();
});