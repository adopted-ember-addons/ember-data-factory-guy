# Setup

Throughout this documentation,In the following examples, we will assume our application has the following models:

<!-- tabs:start -->

### **models/user.js**

```javascript
import Model, { attr, hasMany } from '@ember-data/model';

class User extends Model {
  @attr('string') name;
  @attr('string') style;
  @hasMany('project') projects;
  @hasMany('hat', { polymorphic: true }) hats;
}
```

#### **models/project.js**

```javascript
import Model, { attr, belongsTo } from '@ember-data/model';

class Project extends Model {
  @attr('string') title;
  @belongsTo('user') user;
}
```

#### **models/hat.js (Polymorphic)**

```javascript
import Model, { attr, belongsTo } from '@ember-data/model';

class Hat extends Model {
  @attr('string') type;
  @belongsTo('user') user;
}

class BigHat extends Hat();
class SmallHat extends Hat();
```

<!-- tabs:end -->
