import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

const UserList = <template>
  Users:
  <ul>
    {{#each @users as |user|}}
      <li class="user">
        <label>Name:</label>
        <span class="name">{{user.name}}</span>
        <label>Style:</label>
        <span class="style">{{user.style}}</span>
        <span><button
            type="button"
            {{on "click" (fn @deleteUser user)}}
          >X</button></span>
      </li>
    {{/each}}
  </ul>
</template>;
export default UserList;
