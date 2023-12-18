const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {userExtractor} = require('../utils/middleware')

// for providing blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user',{ username: 1, name: 1 })
  response.json(blogs)
  })

// for creating blogs
blogsRouter.post('/',userExtractor, async (request, response) => {
    const body = request.body
    if(!body.title || !body.url){
      return response.status(400).end()
    }
    const user = request.user 
    
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  })

// for deleting blogs
blogsRouter.delete('/:id',userExtractor,async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if(blog.user._id.toString() === user._id.toString()){
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    }else{
      response.status(401).end()
    }
  })

// for updating likes on blogs
blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, {likes: body.likes},{new: true})
    response.json(updatedBlog)
  })

module.exports = blogsRouter