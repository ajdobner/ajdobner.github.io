# Some notes on teaching the construction of measures

Last semester I taught a measure theory course based off of Terry Tao's book [*An Intruction to Measure Theory*](https://terrytao.wordpress.com/books/an-introduction-to-measure-theory/). This particular course (Math 551 at the University of Michigan) was geared towards graduate students in math-adjacent departments, and was meant to go at a more leisurely pace than a standard measure theory class geared towards first year math PhD students. In particular, most of the course was focused on just developing Lebesgue measure and Lebesgue integration, and at the end did we discuss the theory of abstract measure spaces. 

My own goal in teaching the class was to develop everything in a way that was as well-motivated as possible. I think the standard approach can be pretty opaque. For example, I think most would agree that [Carathéodory's criterion](https://en.wikipedia.org/wiki/Carathéodory%27s_criterion) is quite mysterious the first time you learn it (and maybe the second time too...). Terry's book is quite nice because it motivates the Lebesgue measure by first developing the simpler theory of [Jordan measure](https://en.wikipedia.org/wiki/Peano–Jordan_measure). The definition of the Jordan measure is extremely natural, but most courses skip over it because it's not necessary for the purposes of defining Lebesgue measure. However, I think it can be helpful to see the "wrong" approach before getting to the right one.

I this note I want to give a short account of how I ultimately presented things. I didn't diverge from Terry's book in any significant way, but I did try to draw out the parallels between the Jordan approach and the Lebesgue approach more. For ease of exposition, I'll make the simplifying assumption that **all** sets under consideration are subsets of $[0,1]$. The reason for this is that working in an ambient set that has finite measure is the most natural setting for doing measure theory. This finite case also captures all the essential difficulties because once you've dealt with it you can glue together intervals to get a measure on all of $\mathbb{R}$. Similarly, going from $1$-dimensional space to $d$-dimensional space doesn't really add anything new.

## Step 0: Intervals

~~~latex
\begin{test}
\end{test}
~~~

