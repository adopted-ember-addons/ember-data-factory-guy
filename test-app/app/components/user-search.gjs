import { on } from '@ember/modifier';

const UserSearch = <template>
  <div>Search For User:</div>
  <label>Username:
    <input
      class="user-name"
      type="textbox"
      value={{@userName}}
      {{on "change" @setUserName}}
    /></label>
  <button class="find-user" type="button" {{on "click" @userSearch}}>Go</button>
</template>;
export default UserSearch;
