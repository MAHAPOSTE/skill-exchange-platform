import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <header>
        <h2>Skill Exchange Platform</h2>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main>
        <section>
          <h1>Share Skills. Learn Together.</h1>

          <p>
            Connect with people, exchange skills, learn from mentors,
            and grow together.
          </p>

          <Link to="/register">
            <button>Get Started</button>
          </Link>
        </section>

        <section>
          <h2>Explore Skills</h2>
          <p>
            Find people who can teach you the skills you want to learn.
          </p>
        </section>

        <section>
          <h2>Join Communities</h2>
          <p>
            Connect with learners and mentors through communities.
          </p>
        </section>

        <section>
          <h2>Learn From Mentors</h2>
          <p>
            Connect with approved mentors and exchange knowledge.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Home;