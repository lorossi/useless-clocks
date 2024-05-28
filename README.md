# Useless Clocks

*A collection of useless clocks. Weird.*

[Try it out!]()

[Instagram Post]()

## Some Examples

![gear-clock](/output/gear_clock.gif)
![circle-clock](/output/circle_clock.gif)
![start-clock](/output/star_clock.gif)
![bar-clock](/output/bar_clock.gif)
![sine-clock](/output/sine_clock.gif)
![shuffled-clock](/output/shuffled_clock.gif)
![triangle-clock](/output/triangle_clock.gif)
![modulated-sines-clock](/output/modulated_sines_clock.gif)

## Wait what?

I always try hard to describe the idea and the reasoning behind each and every of my project, embellishing the *(often boring)* process of coding with a bit of *(always real and never invented)* storytelling.

The idea for this absolutely dumb and utterly useless project came to me while I was sleeping.
All my half-asleep brain could see in my spinning room was a bunch of changing clocks, each one with a different time format, equally useless and equally fascinating.
As soon as I woke up, I completely forgot about it and went on with my day to day life.

A few weeks pass by, and in a moment of pure and complete procrastination, I decided to start this project.
Some designs *(such as the ones including sine waves and the triangles one)* have been inspired by an exhibition from about 15 years ago at Hangar Bicocca in Milan, Italy. Sadly, I cannot for the life of me remember the name of the artist or the exhibition, but I clearly remember going there multiple times just to have a look at projection on a big screen of a series of time-telling animations.
In my *"early programmer days"*, I recall trying to replicate the sine wave clock in AutoIt *(a quite terrible language that somehow supported openGL or something like that)* without being ever able to make it work.

After a few more months, I finally wrapped this project up and managed to publish it. I hope you enjoy it as much as I did while coding it.

## What's inside?

This project contains multiple useless clocks, each one representing the current time in a different, and completely unreadable, way.
You can navigate the different clocks either clicking *(or tapping)* to the left and right of the screen, or using `q` and `e` keys.

To see a description of each clock *(reported here as well)*, click *(or tap)* the button below the clock itself or keep scrolling.

### Descriptions (in alphabetical order)

#### Angle Clock

Another day, another useless clock. The time is represented by angles, but their size is inversely proportional to the current time: the bigger the angle, the smaller the time. The angles are drawn from milliseconds to hours in an anti-clockwise fashion, and the whole thing rotates clockwise. This clock is also unreadable, but in a very fancy way.

#### Bar Clock

This is probably one of the most readable clocks (this statement really tells a story). Each bar fills up proportionally to the current time, from milliseconds (left) to hours (right). The bars get move almost slowly over time, giving almost the idea of being able to read what it is actually shown. Yeah, almost.

#### Binary Clock

I have seen plenty of clocks similar to this, from watches to wall clocks, and they never fail to fascinate me: because they are outrageous unreadability. This clock tells the time in binary; however, the actual time is not represented, but rather the number of milliseconds since the Unix Epoch (January 1st, 1970). Even if you know are able to read the binary value and convert it to decimal, it is still impossible to tell the time without doing quite a lot of calculations. And a clock.

#### Circle Clock

This clock is a masterpiece of uselessness: each circle represents a different unit of time, from milliseconds to hours. The radius of each circle is proportional to the current time. The thing that I like the most is the fact that is nearly impossible to tell how big a circle by comparing it to the others, or even trying to get the value it is trying to represent. Awesome!

#### Frequency Sine Clock

This clock is similar to the other one using sines to tell the time, but the actual time is represented by the frequency of each sine wave and not by its length. It is very similar to the other sinusoidal clocks, but it is also very different. It is one of my favourites.

#### Gear Clock

In this clock, each rotating circle (ideally, a gear) represents a different unit of time, from milliseconds to hours: the position of the black line represents the corresponding value of the current time. The gears rotate over time, replicating the movement of a real clock. Between all the clocks in this collection, this is probably one of the few that makes sense. On a side note, I would love to build a real clock out of this (without the milliseconds) and hang it on my wall. Wouldn't that look nice? It would also sound very noisy. But everything comes with a price, I guess.

#### Lines Binary Clock

This clock is similar to the Binary Clock already shown in the collection, but instead of using squares, it uses lines. The seconds since the Unix Epoch are converted to binary, and each line represents a bit. The lines are drawn from top to bottom, so the first line represents the most significant bit, and the last line represents the least significant bit. This clock is also unreadable, even more than the other one: it's a thousand times messier.

#### Lines Clock

At first glance, it almost looks like you could tell the time on this clock: there are 4 lines, each representing a different unit of time, rotating around a central point. However, the lines rotate in random directions and have a random offset, making it impossible to tell the time; furthermore, since each hand is as wide as the whole clock, there's just no way of telling the current value it is pointing. Is it 3 or 9? This clock is a perfect example of how to make something that looks like it could be useful, but it is not.

#### Modulated Sines Clock

This clock is similar to the Sine Clock, but the sine waves are modulated by another sine wave. Each line still represents a different unit of time, but the created shape is more interesting; however, not more readable. Try it, I guarantee.

#### Multiple Circles Clock

This clock is really anti-intuitive and particularly hard to read: each circle represents a unit of time, from milliseconds to hours, where the radius represents the amount. The catch is that it's actually impossible to tell which circle represents which value and to measuring the radius is an equally difficult task. This is almost an Herculean task.

#### Only One is Right

This clock is an unicum in the whole collection: it actually shows the correct time! But only one of the clock faces is actually correct, while all the other show are not. Which is the working one? You tell me.

#### Polygon Clock

The time in this clock is represented by the number of sides of each polygon. The polygons are drawn from milliseconds (top left) to hours (bottom right). It's really really hard to tell the time on this clock, because shapes with more than 15-20 sides are basically indistinguishable from one another. Or from a circle, for that matter.

#### Shuffled Clock

This is not only completely useless, but also unreadable. The current time is used to seed a random number generator, which is then used to shuffle the string representation of the current time. The result is a unique string that changes each millisecond: however, to actually know the time, it would be necessary to get the date, study the implemented shuffling algorithm, and then apply it backwards to the string. Isn't that great?

#### Sine Clock

This clock makes use of the sinusoidal trigonometric function to represent the time. Each line represents a different unit of time, from milliseconds to hours. The length of each line is proportional to the current time. The frequency of the sine wave is also proportional to the unit of time, so the milliseconds line has a frequency of 1, the seconds line has a frequency of 60, the minutes line has a frequency of 60, and the hours line has a frequency of 24.

#### Small Circles Clock

The time is this clock is shown by filling up a grid of small circles: each circle represents a unit of time. I like this clock because, unlike others, it is not that chaotic (thanks to the grid-shaped layout), but it is still impossible to tell the time at first (or second, or third) glance (if ever).

#### Small Lines Clock

This clock is similar to the Lines Clock, but each line is smaller and there are more of them. The lines are also randomly rotated, making it even more impossible to tell the time. This makes the composition pretty static and without many moving objects, but don't let it fool you: what time is it?

#### Small Squares Clock

This clock shows the time by rotating squares. From the top (milliseconds) to the bottom (hours), the rotation of each clock represents the relative time unit. But how do I measure the rotation? But wait, why don't the squares rotate at a constant speed? How do I even try to read the time? I don't know, but it looks cool.

#### Star Clock

This clock is based on the idea of a star: each star has a different number of points, from milliseconds (top left) to hours (bottom right). Furthermore, the ratio between inner and outer radius, the rotation of each star, and the number of points are randomized at each time. This clock is extremely unreadable, but it's also very pretty. I like it and I would probably print it to hang on a wall.

#### Squares Clock

This is one of the clocks that despite looking (hopefully) quite clean and tidy, are actually absolutely unreadable. The unit of time in each square is represented by the level of transparency of the square itself, from milliseconds (top left) to hours (bottom right). Once again, this shows that tidiness and order don't necessarily mean readability.

#### Triangle Clock

This clock is similar to the Bar Clock, but instead of using bars, it uses triangles. Each triangle represents a different unit of time, from milliseconds (left) to hours (right). The triangles get filled over time, giving almost the idea of being able to read what it is actually shown. Almost.

#### XOR128 Clock

This clock is based on the XOR128 random number generator. Every few milliseconds it gets seeded with the current time; each of the line is then rotated in a random direction by 45 degrees. It's actually impossible to read the time on this one, but since the algorithm is fully repeatable, there could be a way of finding out the time by starting from a screenshot. Completely useless, I know. And I am so proud of it.

## Credits

This project is distributed under MIT license.
I don't claim any rights over the external libraries and assets packaged inside the project.

Font [Hack](https://sourcefoundry.org/hack/) by [Source Foundry](https://sourcefoundry.org/) is included under [MIT license](https://github.com/source-foundry/Hack/blob/master/LICENSE.md).
