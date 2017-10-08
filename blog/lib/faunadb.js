import faunadb, {query as q} from 'faunadb';

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

export function setupFaunaDBSchema() {
  console.log("setupFaunaDBSchema");
  return faunaClient.query(
    q.Do(
      q.CreateClass({name: "posts"}),
      q.CreateClass({name: "authors"}),
      q.CreateClass({name: "comments"})
    )
  ).then(()=>{
    return faunaClient.query(
      q.Do(
        q.CreateIndex( {
          name: "all_posts",
          source: q.Class("posts")
        }),
        q.CreateIndex( {
          name: "all_authors",
          source: q.Class("authors")
        }),
        q.CreateIndex( {
          name: "all_comments",
          source: q.Class("comments")
        }),
        q.CreateIndex( {
          name: "author_by_id",
          source: q.Class("authors"),
          unique: true,
          terms: [{
            field: ["data", "id"]
          }]
        })
      )
    )
  }).catch((e) => console.log(e));
}

export function createPost(post) {
  return faunaClient.query(
    q.Select("data", q.Create(q.Class("posts"), {data : post}))
  );
}

export function getPosts() {
  return faunaClient.query(
    q.Select("data", q.Map(
      q.Paginate(q.Match(q.Index("all_posts"))),
      (row) => q.Select("data", q.Get(row))
    ))
  );
}

export function getAuthor(id) {
  return faunaClient.query(
    q.Select("data", q.Get(q.Match(q.Index("author_by_id"), id)))
  );
}

export function getAuthors() {
  return faunaClient.query(
    q.Select("data", q.Map(
      q.Paginate(q.Match(q.Index("all_authors"))),
      (row) => q.Select("data", q.Get(row))
    ))
  );
}

export function getComments() {
  return faunaClient.query(
    q.Select("data", q.Map(
      q.Paginate(q.Match(q.Index("all_comments"))),
      (row) => q.Select("data", q.Get(row))
    ))
  );
}
