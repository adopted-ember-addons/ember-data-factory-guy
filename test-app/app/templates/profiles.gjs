import RouteTemplate from 'ember-route-template';
import ProfileList from 'test-app/components/profile-list';

export default RouteTemplate(
  <template><ProfileList @profiles={{@model}} /></template>,
);
