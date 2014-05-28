Department = DS.Model.extend({
  employees: DS.hasMany('employee', {async: true})
})

