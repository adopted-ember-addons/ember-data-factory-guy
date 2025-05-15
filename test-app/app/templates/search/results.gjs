import RouteTemplate from 'ember-route-template';
import SingleUser from 'test-app/components/single-user';

export default RouteTemplate(
  <template>
    {{#each @model as |user|}}
      <SingleUser @user={{user}} />
    {{/each}}
    {{#if @model.errors}}
      <div>Errors {{@model.message}}</div>
    {{/if}}
    {{#if @controller.nextPage}}
      <span class="meta">Next Page</span>
    {{/if}}
    {{#if @controller.previousPage}}
      <span class="meta">Previous Page</span>
    {{/if}}
  </template>,
);
