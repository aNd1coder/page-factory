var App = {
    alert: function (content) {
        var d = dialog({
            content: content
        });

        d.show();

        setTimeout(function () {
            d.close().remove();
        }, 2000);
    },
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
    buildModule: function () {
        var form = $('.modal-module .form-module'), formGroup = form.find('.form-group'),
            templateData = {fields: []}, template = form.find('[name="template"]').val(),
            isArray = $('#content').hasClass('form-inline');

        if (formGroup.length > 0) {
            if (isArray) { // 数组数据
                templateData.rows = [];

                formGroup.each(function (index, group) {
                    var row = [];

                    $(this).find('.form-control').each(function () {
                        var me = $(this), name, label, rule, value;

                        name = me.attr('name');
                        label = $.trim(me.prev('.input-group-addon').html());
                        rule = me.data('rule');
                        value = $.trim(me.val());

                        if (index == 0) {
                            templateData.fields.push([name, label, rule]);
                        }

                        row.push(value);
                    });

                    templateData.rows.push(row);
                });
            } else {
                formGroup.find('.form-control').each(function () {
                    var me = $(this), name, label, rule, value;

                    name = me.attr('name');
                    label = $.trim(me.prev('.input-group-addon').html());
                    rule = me.data('rule');
                    value = $.trim(me.val());

                    templateData.fields.push([name, label, rule, value]);
                });
            }

            $('[name="content"]').html(App.compile(template, templateData[isArray ? 'rows' : 'fields']));
            $('[name="templateData"]').html(JSON.stringify(templateData));
        }
    },
    buildPage: function () {
        var form = $('.modal-module .form-module'),
            formGroup = form.find('.form-group'),
            template = $('#tpl-page-module').html(),
            html = '', module = [];

        if (formGroup.length > 0) {
            formGroup.each(function () {
                var row = [];

                $(this).find('.form-control').each(function () {
                    var me = $(this), value = $.trim(me.val());
                    row.push(value);
                });

                module.push(row);
            });

            // keep one line
            html = App.compile(template, module).replace(/>(\s+)</gim, function (s) {
                return s.replace(/\s+/, '');
            });
        }

        $('[name="content"]').html(html);
        $('[name="module"]').val(JSON.stringify(module));
    },
    init: function () {
        $('.table').each(function () {
            var me = $(this), cols = me.find('thead th'), rows = me.find('tbody>tr');
            if (rows.length == 0) {
                me.find('tbody').append('<tr><td style="padding: 20px 0;text-align: center;" colspan="' + cols.length + '">无相关数据</td></tr>');
            }
        }).on('click', '.btn-delete', function () {
            var me = $(this), url = me.attr('href'), d = dialog({
                title: '提示',
                content: '确认删除?',
                okValue: '确定',
                ok: function () {
                    $.ajax({
                        type: 'DELETE',
                        url: url,
                        success: function (result) {
                            if (result.code == 0) {
                                me.parents('tr').remove();
                            } else {
                                App.alert(result.message);
                            }
                        }
                    });
                },
                cancelValue: '取消',
                cancel: function () {
                }
            });

            d.show();

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
            App.alert('复制成功!');
        });

        $('[name="filetype"]').change(function () {
            var type = $(this).val();
            $('[name="content"]')[type == 'html' ? 'wrap' : 'unwrap']('<div class="html-editor"></div>');
        });

        $('#form').submit(function () {
            $(this).find('#content').remove();
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
                clone.find('input.form-control').val('');
            }).on('click', '.btn-delete', function () {
                var row = $(this).parents('.form-group'), d = dialog({
                    title: '提示',
                    content: '确认删除?',
                    okValue: '确定',
                    ok: function () {
                        row.remove();
                    },
                    cancelValue: '取消',
                    cancel: function () {
                    }
                });

                d.show();

                return false;
            }).on('click', '.btn-save', function () {
                App[$('html').hasClass('page-page') ? 'buildPage' : 'buildModule']();
                modal.modal('hide');
                return false;
            });

            form.submit(function () {
                return false;
            }).find('#content').sortable();
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
                buttonText: '<i class="glyphicon glyphicon-upload"></i>选择图片上传',
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