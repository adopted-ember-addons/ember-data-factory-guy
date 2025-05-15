import RouteTemplate from 'ember-route-template';
import UserList from 'test-app/components/user-list';

export default RouteTemplate(
  <template>
    <UserList @users={{@model}} @deleteUser={{@controller.deleteUser}} />
  </template>,
);
