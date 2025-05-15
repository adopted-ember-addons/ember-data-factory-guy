import RouteTemplate from 'ember-route-template';
import UserSearch from 'test-app/components/user-search';

export default RouteTemplate(
  <template>
    <UserSearch
      @userSearch={{@controller.userSearch}}
      @userName={{@controller.userName}}
      @setUserName={{@controller.setUserName}}
    />
    <div class="results">
      {{outlet}}
    </div>
  </template>,
);
