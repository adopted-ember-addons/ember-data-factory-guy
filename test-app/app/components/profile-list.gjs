const ProfileList = <template>
  {{#each @profiles as |profile|}}
    <div class="profile">
      <span data-field="description">{{profile.description}}</span>
      <span
        data-field="camelCaseDescription"
      >{{profile.camelCaseDescription}}</span>
      <span
        data-field="snake_case_description"
      >{{profile.snake_case_description}}</span>
    </div>
  {{/each}}
</template>;
export default ProfileList;
