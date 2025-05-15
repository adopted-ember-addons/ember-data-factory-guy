const AnimalList = <template>
  {{#each @animals as |animal|}}
    <div class="{{@species}}">
      <span data-field="name">{{animal.name}}</span>
    </div>
  {{/each}}
</template>;
export default AnimalList;
