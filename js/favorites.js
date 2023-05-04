export class GithubUser {
  static search(username) {
    const endpoint = `http://api.github.com/users/${username}`

    return fetch(endpoint).then(data => data.json()).then(({ login, name, public_repos, followers }) => ({
      login,
      name,
      public_repos,
      followers
      }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();

  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  delete(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login)
    this.update()
    this.save()
  }

  async add(username) {
    try {

      const exists = this.entries.find( entry => entry.login === username)
      
      console.log(exists)

      if(exists) {
        throw new Error ('Usuário já adicionado')
      }

      const user = await GithubUser.search(username)

      if(user.login == undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd()
  }


  onadd() {
    const addButton = this.root.querySelector('.button')
    addButton.onclick = () => {
     const { value } = this.root.querySelector('input')
     
     this.add(value)
    }
  }

  update() {
    this.removeAllTr();

    this.entries.forEach( user => {
      const row = this.createRow();

      row.querySelector(".user img").src = `https://github.com/${user.login}.png`;
      
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repos").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover?')
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row);
    });
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
    <td class="user">
                <img src="https://github.com/caue-bueno.png" alt="">
                <a href="https://github.com/caue-bueno">
                  <p>Caue Bueno</p>
                  <span>/caue-bueno</span>
                </a>
              </td>
              <td class="repos">
                123
              </td>
              <td class="followers">
                15
              </td>
              <td>
                <button class="remove">Remover</button>
              </td>
  `;
    return tr;
  }
}
