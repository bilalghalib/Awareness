import json,httplib
connection = httplib.HTTPSConnection('api.parse.com', 443)
connection.connect()
connection.request('POST', '/1/push', json.dumps({
                                                 "where": {
                                                 "deviceType": "ios"
                                                 },
                                                 "data": {
                                                 "alert": "From Python :D "
                                                 }
                                                 }), {
                   "X-Parse-Application-Id": "KR5NfwVxTQHNQq62xjDD3wucYF5t02uSgt4XVEdV",
                   "X-Parse-REST-API-Key": "0cJcWo67fwAsaoogcnejoBrtzeUxnsRP0A5zYB37",
                   "Content-Type": "application/json"
                   })
result = json.loads(connection.getresponse().read())
print result