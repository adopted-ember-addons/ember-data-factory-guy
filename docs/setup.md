# Setup

Throughout this documentation, we assume some example models that look like this:

```javascript
// standard models
class User extends Model {
  @attr('string') name;
  @attr('string') style;
  @hasMany('project') projects;
  @hasMany('hat', { polymorphic: true }) hats;
}

class Project extends Model {
  @attr('string') title;
  @belongsTo('user') user;
}

// polymorphic models
class Hat extends Model {
  @attr('string') type;
  @belongsTo('user') user;
}

class BigHat extends Hat {}
class SmallHat extends Hat {}
```
