import RouteTemplate from 'ember-route-template';
import SingleUser from 'test-app/components/single-user';

export default RouteTemplate(
  <template>
    {{#if @model}}
      <SingleUser
        @user={{@model}}
        @createProject={{@controller.createProject}}
        @projectTitle={{@controller.projectTitle}}
        @setProjectTitle={{@controller.setProjectTitle}}
      />
    {{else}}
      <div class="error">User not found</div>
    {{/if}}
  </template>,
);
