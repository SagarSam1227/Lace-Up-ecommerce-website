const slugify = require('slugify')

module.exports={
 toSlug:(word1, word2)=> {
        const slug = slugify(`${word1} ${word2}`, {
          lower: true,     // Convert to lowercase
          strict: true,    // Replace any non-alphanumeric characters with a hyphen
          locale: 'en'      // Use English locale for character mapping
        });
        return slug;
      }
}