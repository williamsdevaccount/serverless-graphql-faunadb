![Serverless GraphQL Blog AWS Lambda API Gateway](serverless_graphql_blog.png)

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

# serverless-graphql-blog

This [Serverless Framework](http://www.serverless.com) Project creates a REST API for a basic blog structure, including Posts, Authors and Comments utilizing [GraphQL][1] and FaunaDB for persistent storage.  The entire REST API consists of only 1 endpoint.

This project is based on an earlier Serverless demo. You can read about the original version in this [blog post](http://kevinold.com/2016/02/01/serverless-graphql.html).

## Install & Deploy

Make sure you have the most recent version of the [Serverless Framework](http://www.serverless.com) (1.0 and higher) and you are using NodeV4 or greater.

```
npm install serverless -g
```

Clone this repo:

```
git clone https://github.com/fauna/serverless-graphql-blog
cd serverless-graphql-blog
```

Install (top level) npm dependencies, and blog level dependencies.

```
npm install
cd blog/
npm install
cd ..
```

Sign up for FaunaDB for free, and configure database and a FaunaDB Server Secret for your application. Do this by visiting http://dashboard.fauna.com/ and creating a database, then browse back to its parent database and select Manage Keys > Create a Key. Then create a key with the `server` role and copy the key secret to your `serverless.yaml` file in place of `SERVER_SECRET_FOR_YOUR_FAUNADB_DATABASE`

Now deploy your service, and make note of the POST endpoint URL it's assigned.

```
serverless deploy
```

Invoke the private endpoint for creating the classes and indexes in your FaunaDB database.

```
serverless invoke --function setupFaunaDB
```

### Querying with GraphiQL

The [graphql-js][1] endpoint provided in this Serverless Project is compatible with [GraphiQL][2], a query visualization tool used with [graphql-js][1].

Usage with [GraphiQL.app][3] (an Electron wrapper around [GraphiQL][2]) is recommended and is shown below:

![GraphiQL.app demo](https://s3.amazonaws.com/various-image-files/graphiql-serverless-graphql-blog-screenshot.png)

### Sample GraphQL queries

Before these queries will have anything to read, you'll want to create an author and some posts, at least. To create an author, visit the Author's class in the FaunaDB dashboard. The URL will look something like: `https://dashboard.fauna.com/db/my-graphql-blog/classes/authors`

Click "Create Instance", enter some data like this, and save your author instance.

```json
{
  "name": "Chris",
  "id": "123"
}
```

Now, you can switch to GraphiQL to run a mutation to create a blog post. Make sure and enter the endpoint URL that came back when you ran `serverless deploy`. Now you can enter a query like this to create a blog post for your author.

```graphql
mutation createNewPost {
  post: createPost (id: "5",
    title: "Fifth post!",
    bodyContent: "Test content",
    author: "123") { id, title } }
```

Now that you've created some data, you can run other queries.

#### List of author names
```graphql
{ authors { name } }
```

#### Results
```json
{
  "data":{
    "authors":[
      {"name":"Chris"}
    ]
  }
}
```

### List of posts with id and title
```graphql
{ posts { id, title } }
```

#### Results
```json
{
  "data": {
    "posts": [
      { "id":"1",
        "title":"First Post Title"
      }
    ]
  }
}
```

#### List of posts with id, title and *nested* author name
```graphql
{ posts { id, title, author { name } } }
```

#### Results
```json
{
  "data": {
    "posts": [
      { "id":"1",
        "title":"First Post Title",
        "author":{
          "name":"Chris"
        }
      }
    ]
  }
}
```

#### List of posts with post, author and comments information (for a Post with no comments, i.e. comments:[])
```graphql
{ posts { id, title, author { id, name }, comments { id, content, author { name } } } }
```

#### Results
```json
{
  "data":{
    "posts":[
    {
      "id":"1",
        "title":"First Post Title",
        "author":{
          "id":"1",
          "name":"Kevin"
        },
        "comments":[]
    }
    ]
  }
}
```


### Sample GraphQL Mutations

These have been expressed in curl, but you can use GraphiQL instead.

#### Create Post
```sh
curl -XPOST -d '{"query": "mutation createNewPost { post: createPost (id: \"5\", title: \"Fifth post!\", bodyContent: \"Test content\", author: \"1\") { id, title } }"}' <endpoint>/dev/blog/graphql
```

#### Results
```json
{
  "data":{
    "post":{
      "id":"5",
      "title":"Fifth post!"
    }
  }
}
```


#### Mutation Validation

If your blog post title is too short it will fail. Validations are defined using [graphql-custom-types][4] in [blog/lib/schema.js][5]

```sh
curl -XPOST -d '{"query": "mutation createNewPost { post: createPost (id: \"8\", title: \"123456789\", bodyContent: \"Test content 5\") { id, title } }"}' <endpoint>/dev/blog/graphql
```

#### Results
```json
{
  "errors":[
  {
    "message":"Query error: String not long enough"}
  ]
}
```


### Introspection Query
```sh
curl -XPOST -d '{"query": "{__schema { queryType { name, fields { name, description} }}}"}' <endpoint>/dev/blog/graphql
```

Returns:
```json
{
  "data":{
    "__schema":{
      "queryType":{
        "name":"BlogSchema",
          "fields":[
          {
            "name":"posts",
            "description":"List of posts in the blog"
          },
          {
            "name":"authors",
            "description":"List of Authors"
          },
          {
            "name":"author",
            "description":"Get Author by id"
          }
        ]
      }
    }
  }
}
```

### TODOs and Contribution Opportunities

* Currently there is no creation mechanism for comments or authors, so those have to be created via the FaunaDB Dashboard. Adding Mutations for the cases should be straightforward.

* Currently there is no UI for the blog. Maybe there is an existing graphql powered blog frontend that this backend can be adapted to fit?

* Predicate pushdown is missing, so the graphql layer is not taking advantage of all the query capabilities FaunaDB offers. GraphQL and the FaunaDB query language are similar enough that a full-featured FaunaDB graphql layer could potentially combine queries after the resolver has run.

[1]: https://github.com/graphql/graphql-js
[2]: https://github.com/graphql/graphiql
[3]: https://github.com/skevy/graphiql-app
[4]: https://github.com/stylesuxx/graphql-custom-types
[5]: https://github.com/serverless/serverless-graphql-blog/blob/master/blog/lib/schema.js#L100
