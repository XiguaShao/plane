
/**
 * Created by zxh on 1/14/15.
 */


let fs = require('fs');
let path = require('path');
let xlsx = require('node-xlsx');
let _ = require('lodash');
let rd = require('rd');
let shell = require('shelljs');

//过滤器
let FILE_FILTER = [
    'plant-path',
];

class Excel2json {
    constructor(src, dest) {
        this.src = src;
        this.dest = dest;
    }

    run() {
        console.log(`过滤器: ${FILE_FILTER}`);
        let files = this.pickFles();
        shell.mkdir('-p', this.dest);

        if (!fs.existsSync(this.dest)) {
            console.log(`错误: ${this.dest}目录不存在, 停止导出`);
            return;
        }
        files.forEach((filename) => {
            this.convertFile(filename);
        });
    }

    static pattern(filename) {
        if (_.isEmpty(FILE_FILTER)) {
            return true;
        }

        let item = _.find(FILE_FILTER, (filter) => {
            if (filter instanceof RegExp) {
                return filter.test(filename);
            } else if (_.isString(filter)) {
                return filename.indexOf(filter) !== -1;
            }
            return false;
        });
        return !!item;
    }

    pickFles() {
        let files = rd.readFileFilterSync(this.src, Excel2json.pattern);
        return files;
    }

    static convertFieldValue(value, type) {
        switch (type) {
            case 'json':
                value = JSON.parse(value);
                break;
            case 'float':
                value = parseFloat(value);
                break;
            case 'int':
                value = parseInt(value, 10);
                break;
            default:
        }
        return value;
    }

    /**
     * 转换文件
     * @param {string} xlsxFilename 
     */
    convertFile(xlsxFilename) {
        let xlsxObject;
        try {
            xlsxObject = xlsx.parse(xlsxFilename);
        } catch (e) {
            console.log(`打开文件Excel文件:${xlsxFilename}失败, 跳过!`);
            return;
        }

        xlsxObject.forEach(sheet => this.importSheet(sheet));
    }

    importSheet(sheet) {
        let fieldNames = sheet.data.shift();
        let fieldComments = sheet.data.shift();
        let fieldTypes = sheet.data.shift();
        sheet.data.shift(); //中文字段
        let data = sheet.data;
        let table = [];
        data.forEach((fields) => {
            let record = {};
            fields.forEach((value, index) => {
                let fieldType = fieldTypes[index];
                if (fieldType) {
                    let fieldValue = Excel2json.convertFieldValue(value, fieldType);
                    record[fieldNames[index]] = fieldValue;
                }
            });
            table.push(record);
        });

        let exportFilename = `${path.join(this.dest, sheet.name)}.json`;
        let jsonString = JSON.stringify(table, null, 4);
        fs.writeFileSync(exportFilename, jsonString, 'utf8');
        console.log(`输出文件: ${exportFilename}`);    
    }
}

let src = process.argv[2]; //'../../../Design/配置表';
let dest = process.argv[3]; //'./assets/resources/config'
let excel2json = new Excel2json(src, dest);
excel2json.run();
process.exit(0);