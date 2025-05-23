import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

const SingleUser = <template>
  <div class="user">
    <h3>User</h3>

    <div class="name">Name: {{@user.name}}</div>
    <div class="funny-name">Funny Name: {{@user.funnyName}}</div>

    Projects:
    <ul>
      {{#each @user.projects as |project|}}
        <li class="project">{{project.title}}</li>
      {{/each}}
    </ul>

    {{#if @setProjectTitle}}
      <label>Project title<input
          class="project-title"
          type="textbox"
          value={{@projectTitle}}
          {{on "change" @setProjectTitle}}
        /></label>
    {{/if}}
    {{#if @createProject}}
      <button
        class="add-project"
        type="button"
        {{on "click" (fn @createProject @user @projectTitle)}}
      >Add Project</button>
    {{/if}}
  </div>
</template>;
export default SingleUser;
