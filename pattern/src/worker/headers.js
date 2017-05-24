/**
 * Created by guntars on 24/05/2017.
 */
let combineHeaders = (source = {}, target = {}) => Object.assign({}, source, target, {headers: Object.assign({}, source.headers, target.headers)}),
    jsonHeader = (extra = {}) => combineHeaders({
        status:     200,
        statusText: 'OK',
        headers:    {
            'Content-Type':     'application/json',
            'X-Local-Response': 'yes'
        }
    }, extra),
    htmlHeader = (extra = {}) => combineHeaders({
        status:     200,
        statusText: 'OK',
        headers:    {
            'Content-Type':     'text/html',
            'X-Local-Response': 'yes'
        }
    }, extra);
export {jsonHeader, htmlHeader}