import { Story } from '../models/Story.js';

export const createStory = async (req, res) => {
  try {
    const { title, blocks, theme, status, isPublic } = req.body;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').slice(0, 50);
    
    console.log('Creating story:', { title, slug, status, isPublic });
    
    const story = new Story({
      userId: req.user?.id,
      title: title || 'Untitled Story',
      blocks: blocks || [],
      theme: theme || '#3b82f6',
      slug: slug + '-' + Date.now(),
      status: status || 'DRAFT',
      isPublic: isPublic || false
    });

    await story.save();
    console.log('Story created:', { id: story._id, slug: story.slug });
    res.status(201).json(story);
  } catch (err) {
    console.error('Create story error:', err);
    res.status(500).json({ msg: err.message });
  }
};

export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, blocks, theme, status, isPublic } = req.body;
    const userId = req.user?.id;

    const existingStory = await Story.findById(id);
    if (!existingStory) return res.status(404).json({ msg: 'Story not found' });
    if (String(existingStory.userId) !== String(userId)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const story = await Story.findByIdAndUpdate(
      id,
      {
        title,
        blocks,
        theme,
        status,
        isPublic,
        updatedAt: new Date()
      },
      { returnDocument: 'after' }
    );
    
    console.log('Story updated:', { id, slug: story.slug, status: story.status });
    res.json(story);
  } catch (err) {
    console.error('Update story error:', err);
    res.status(500).json({ msg: err.message });
  }
};

export const getStoryBySlug = async (req, res) => {
  try {
    const story = await Story.findOne({ slug: req.params.slug });
    if (!story) return res.status(404).json({ msg: 'Story not found' });
    
    // Increment view count
    story.viewCount += 1;
    await story.save();
    
    res.json(story);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find({ status: 'PUBLISHED', isPublic: true })
      .select('title description slug theme viewCount createdAt')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getUserStories = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const stories = await Story.find({ userId })
      .select('title description slug status isPublic theme viewCount createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getUserStoryById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const story = await Story.findOne({ _id: id, userId });
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    res.json(story);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const story = await Story.findOneAndDelete({ _id: id, userId });
    if (!story) return res.status(404).json({ msg: 'Story not found' });
    res.json({ msg: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
