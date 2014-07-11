""" Basic todo list using webpy 0.3 """
import web
import model

### Url mappings

urls = (
    '/submit', 'Index',
    '/del/(\d+)', 'Delete',
    '/about', 'About',
    '/join', 'Join'
)

### Templates
render = web.template.render('templates', base='base')

class Index:

    form = web.form.Form(
        web.form.Textbox('sendURL', web.form.notnull, 
            description="Add this URL:"),
        
        web.form.Textbox('validator', web.form.notnull,
            description="twitter handle:"),

	web.form.Button('Add event'),
    )

    def GET(self):
        """ Show page """
        alerts = model.get_alerts()
        form = self.form()
        return render.index(alerts, form)

    def POST(self):
        """ Add new entry """
        form = self.form()
        if not form.validates():
            alerts = model.get_alerts()
            return render.index(alerts, form)
        model.new_alerts(form.d.validator,form.d.sendURL)
        raise web.seeother('/submit')

class About():
    def GET(self):
        return render.about()

class Join():

    formNewResponder = web.form.Form(
        web.form.Textbox('newResponder',
            description="Twitter Handle:"),

        web.form.Button('Join First Responders'),
    )

    formNewValidator = web.form.Form(
        web.form.Textbox('newValidator', 
            description="Twitter Handle:"),

        web.form.Button('Join Validator team'),
    )

    def GET(self):
        """ Show page """
        formNewResponder = self.formNewResponder()
        formNewValidator = self.formNewValidator()
        return render.join(formNewResponder, formNewValidator)

    def POST(self):
        """ Add new entry """
        formR = self.formNewResponder()
        formV = self.formNewValidator()

        if not formR.validates():
            return render.join(formR,formV)
        model.new_Responder(formR.d.newResponder)

        if not formV.validates():
            return render.join(formR,formV)
        model.new_Validator(formV.d.newValidator)

        raise web.seeother('/join')

class Delete:

    def POST(self, id):
        """ Delete based on ID """
        id = int(id)
	print "this is the ID"
	print id
        model.del_alert(id)
        raise web.seeother('/submit')


app = web.application(urls, globals())

if __name__ == '__main__':
    app.run()

