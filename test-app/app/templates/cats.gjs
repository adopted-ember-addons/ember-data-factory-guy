import RouteTemplate from 'ember-route-template';
import AnimalList from 'test-app/components/animal-list';

export default RouteTemplate(
  <template><AnimalList @animals={{@model}} @species="cat" /></template>,
);
