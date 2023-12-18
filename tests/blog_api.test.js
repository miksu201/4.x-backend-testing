const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})
describe('providing blogs', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all blogs have field id', async () => {
    const response = await api.get('/api/blogs')

    for(let i of response.body){
      expect(i.id).toBeDefined()
    }
  })
})

describe('post of a blogs', () => {
  test('a blog can be added ', async () => {
    const newBlog = {
      title: "Test Blog1",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
    }

    await api.post('/api/blogs').send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
      'Test Blog1'
    )
  })

  test('a blog without likes is zero', async () => {
    const newBlog = {
      title: "Test Blog2",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
    }

    await api.post('/api/blogs').send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.pop().likes).toBe(0)
  })

  test('a blog without title or url is 400', async () => {
    const newBlog1 = {
      title: "Test Blog3",
      author: "Michael Chan"
    }
    const newBlog2 = {
      author: "Michael Chan",
      url: "https://reactpatterns.com/"
    }

    await api.post('/api/blogs').send(newBlog1).expect(400)
    await api.post('/api/blogs').send(newBlog2).expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.set('Accept', 'application/json').delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })
})

describe('update of a blog', () => {
  test('succeeds with updated likes: 21', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    await api.put(`/api/blogs/${blogToUpdate.id}`).send({likes: 21})
    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd[0].likes).toBe(21)
  })
})

describe('creating a user with on 1 user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })
  test('creation does not succeed with no username', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser1 = {
      name: 'test_name',
      password: 'no1knows',
    }
    await api
      .post('/api/users')
      .send(newUser1)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
  test('creation does not succeed with short username', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser2 = {
      username: "te",
      name: 'test_name',
      password: 'no1knows',
    }
    await api
      .post('/api/users')
      .send(newUser2)
      .expect(422)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
  test('creation does not succeed with pre-existing username', async () => {
    const usersAtStart = await helper.usersInDb()
    const dublicate = {
      username: "root",
      name: 'test_name',
      password: 'no1knows',
    }
    await api
      .post('/api/users')
      .send(dublicate)
      .expect(409)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await mongoose.connection.close()
})